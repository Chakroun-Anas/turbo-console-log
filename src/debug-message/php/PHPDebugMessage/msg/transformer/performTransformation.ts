import type vscode from 'vscode';
import {
  walk,
  isArrowFunc,
  isFunction,
  isMethod,
  isVariable,
  type PHPNode,
  type ArrowFunc,
  type Function as PHPFunction,
  type Method,
  type Parameter,
  type Variable,
} from '../php-parser-utils';
import { containsVariable } from './helpers';

interface TransformationOptions {
  tabSize: number;
}

/**
 * Performs code transformation for PHP edge cases where simple log insertion isn't sufficient.
 *
 * Handles:
 * 1. Arrow functions (fn($x) => ...) - converts to regular anonymous function with block
 * 2. Empty function declarations - adds log statement to empty body
 * 3. Empty method declarations - adds log statement to empty body
 *
 * @param ast - The parsed PHP AST
 * @param document - The VS Code text document
 * @param line - The line number where the variable is selected (0-based)
 * @param selectedVar - The variable name (without $ prefix)
 * @param debuggingMsg - The debug log statement to insert
 * @param options - Transformation options (tabSize)
 * @returns The transformed source code
 */
export function performTransformation(
  ast: PHPNode,
  document: vscode.TextDocument,
  line: number,
  selectedVar: string,
  debuggingMsg: string,
  options: TransformationOptions,
): string {
  const sourceCode = document.getText();
  if (!ast) {
    return sourceCode;
  }

  const normalized = debuggingMsg.trim();

  /**
   * Helper to check if a parameter matches the selected variable name.
   * PHP parameter names can be string or Identifier objects.
   */
  function paramMatches(param: Parameter): boolean {
    // Parameter name can be a string or an Identifier object
    const paramName =
      typeof param.name === 'string'
        ? param.name
        : (param.name as { name: string }).name;

    return paramName === selectedVar || paramName === `$${selectedVar}`;
  }

  /**
   * Get the indentation at a specific offset in the source code
   */
  function getIndentAtOffset(offset: number): string {
    const lineStart = sourceCode.lastIndexOf('\n', offset - 1) + 1;
    const lineEnd = sourceCode.indexOf('\n', lineStart);
    const lineText =
      lineEnd >= 0
        ? sourceCode.slice(lineStart, lineEnd)
        : sourceCode.slice(lineStart);
    const match = lineText.match(/^(\s*)/);
    return match ? match[1] : '';
  }

  let transformedCode: string | null = null;
  let start = -1;
  let end = -1;

  walk(ast, (node: PHPNode) => {
    if (transformedCode !== null) return true; // Already transformed
    if (!node.loc) return;

    const startLine = node.loc.start.line - 1; // Convert to 0-based
    const endLine = node.loc.end.line - 1;
    const inRange = line >= startLine && line <= endLine;

    if (!inRange) return;

    const nodeStart = node.loc.start.offset;
    const nodeEnd = node.loc.end.offset;

    // 🟩 Arrow Function - convert to regular anonymous function with block
    if (isArrowFunc(node)) {
      const arrowFunc = node as ArrowFunc;

      const param = arrowFunc.arguments.some(paramMatches);
      const varUsedInBody = containsVariable(arrowFunc.body, selectedVar);

      if (param || varUsedInBody) {
        // Extract the body expression
        const bodyStart = arrowFunc.body.loc?.start.offset ?? nodeStart;
        const bodyEnd = arrowFunc.body.loc?.end.offset ?? nodeEnd;
        const bodyText = sourceCode.slice(bodyStart, bodyEnd);

        // Extract everything before the arrow (includes parameters)
        // Find the "=>" in the source
        const beforeBody = sourceCode.slice(nodeStart, bodyStart);
        const arrowIndex = beforeBody.lastIndexOf('=>');
        const beforeArrow = sourceCode
          .slice(nodeStart, nodeStart + arrowIndex)
          .trimEnd();

        const indent = getIndentAtOffset(nodeStart);
        const bodyIndent = indent + ' '.repeat(options.tabSize);

        // Collect all variables used in the arrow function body (for use clause)
        // Arrow functions auto-capture parent scope, but regular functions need explicit 'use'
        const capturedVars = new Set<string>();
        const paramNames = new Set(
          arrowFunc.arguments.map((p) => {
            const name =
              typeof p.name === 'string'
                ? p.name
                : (p.name as { name: string }).name;
            // Remove $ prefix if present
            return name.startsWith('$') ? name.substring(1) : name;
          }),
        );

        // PHP superglobals that should NOT be captured
        const superglobals = new Set([
          '_GET',
          '_POST',
          '_SERVER',
          '_SESSION',
          '_COOKIE',
          '_FILES',
          '_ENV',
          '_REQUEST',
          'GLOBALS',
          'this', // $this is automatically available in object context
        ]);

        // Walk the body to find all variables
        walk(arrowFunc.body, (child: PHPNode) => {
          if (isVariable(child)) {
            const varNode = child as Variable;
            if (typeof varNode.name === 'string') {
              const varName = varNode.name.startsWith('$')
                ? varNode.name.substring(1)
                : varNode.name;
              // Only capture if it's not a parameter and not a superglobal
              if (!paramNames.has(varName) && !superglobals.has(varName)) {
                capturedVars.add(varName);
              }
            }
          }
        });

        // Build use clause if there are captured variables
        const useClause =
          capturedVars.size > 0
            ? ` use ($${Array.from(capturedVars).join(', $')})`
            : '';

        // Replace "fn" with "function" and build the new block body
        const newDeclaration = beforeArrow.replace(/\bfn\b/, 'function');
        const returnStatement = `return ${bodyText.trim()};`;
        const newBody = `${useClause} {\n${bodyIndent}${normalized}\n${bodyIndent}${returnStatement}\n${indent}}`;

        transformedCode = newDeclaration + newBody;
        start = nodeStart;
        end = nodeEnd;
        return true;
      }
    }

    // 🟩 Empty Function Declaration
    if (isFunction(node)) {
      const funcDecl = node as PHPFunction;

      if (
        funcDecl.body &&
        funcDecl.body.children.length === 0 &&
        funcDecl.arguments.some(paramMatches)
      ) {
        const indent = getIndentAtOffset(nodeStart);
        const bodyIndent = indent + ' '.repeat(options.tabSize);

        // Find the function body start (opening brace)
        const bodyStart = funcDecl.body.loc?.start.offset ?? nodeEnd - 2;

        // Extract everything before the body
        const beforeBody = sourceCode.slice(nodeStart, bodyStart);

        // Build the new block body
        const newBody = `{\n${bodyIndent}${normalized}\n${indent}}`;

        transformedCode = beforeBody + newBody;
        start = nodeStart;
        end = nodeEnd;
        return true;
      }
    }

    // 🟩 Empty Method Declaration
    if (isMethod(node)) {
      const methodDef = node as Method;

      if (
        methodDef.body &&
        methodDef.body.children.length === 0 &&
        methodDef.arguments.some(paramMatches)
      ) {
        const indent = getIndentAtOffset(nodeStart);
        const bodyIndent = indent + ' '.repeat(options.tabSize);

        // Find the method body start (opening brace)
        const bodyStart = methodDef.body.loc?.start.offset ?? nodeEnd - 2;

        // Extract everything before the body
        const beforeBody = sourceCode.slice(nodeStart, bodyStart);

        // Build the new block body
        const newBody = `{\n${bodyIndent}${normalized}\n${indent}}`;

        transformedCode = beforeBody + newBody;
        start = nodeStart;
        end = nodeEnd;
        return true;
      }
    }
  });

  if (transformedCode === null || start === -1 || end === -1) {
    return sourceCode; // No transformation applied
  }

  const finalCode =
    sourceCode.slice(0, start) + transformedCode + sourceCode.slice(end);
  return finalCode;
}
