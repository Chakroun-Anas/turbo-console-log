import vscode from 'vscode';
import {
  walk,
  isArrowFunctionExpression,
  isBlockStatement,
  isFunctionDeclaration,
  isMethodDefinition,
  isIdentifier,
  isObjectPattern,
  isArrayPattern,
  isRestElement,
  isAssignmentPattern,
  isProperty,
  isTSParameterProperty,
  type AcornNode,
  type ArrowFunctionExpression,
  type FunctionDeclaration,
  type FunctionExpression,
  type MethodDefinition,
  type Identifier,
} from '../acorn-utils';
import { containsVariable } from './helpers';

interface TransformationOptions {
  addSemicolonInTheEnd: boolean;
  tabSize: number;
}

export function performTransformation(
  ast: AcornNode,
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

  const positionToLine = (pos: number) =>
    sourceCode.slice(0, pos).split('\n').length - 1;

  const trimmed = debuggingMsg.trim();
  const normalized =
    options.addSemicolonInTheEnd && !trimmed.endsWith(';')
      ? trimmed + ';'
      : !options.addSemicolonInTheEnd && trimmed.endsWith(';')
        ? trimmed.slice(0, -1)
        : trimmed;

  /**
   * Helper to check if a parameter matches the selected variable name.
   * Handles regular parameters, TypeScript parameter properties, and destructuring patterns.
   */
  function paramMatches(param: AcornNode): boolean {
    // Regular identifier parameter
    if (isIdentifier(param) && (param as Identifier).name === selectedVar) {
      return true;
    }

    // TypeScript parameter property (e.g., `protected firstDependency: Type`)
    if (isTSParameterProperty(param)) {
      if (param.parameter && isIdentifier(param.parameter)) {
        return (param.parameter as Identifier).name === selectedVar;
      }
    }

    // Destructuring patterns: [key, data] or { prop1, prop2 }
    if (isObjectPattern(param) || isArrayPattern(param)) {
      return findVariableInPattern(param, selectedVar);
    }

    return false;
  }

  /**
   * Recursively searches for a variable name within destructuring patterns.
   */
  function findVariableInPattern(
    pattern: AcornNode,
    variableName: string,
  ): boolean {
    if (!pattern) return false;

    const visited = new Set<AcornNode>();
    const MAX_DEPTH = 1000;
    let depth = 0;

    function search(node: AcornNode): boolean {
      if (!node || visited.has(node) || depth++ >= MAX_DEPTH) return false;
      visited.add(node);

      // Direct identifier match
      if (isIdentifier(node) && node.name === variableName) {
        return true;
      }

      // Object pattern: { key: value, key2, ...rest }
      if (isObjectPattern(node)) {
        for (const prop of node.properties || []) {
          if (isProperty(prop)) {
            if (search(prop.value)) return true;
          } else if (isRestElement(prop as AcornNode)) {
            const restProp = prop as AcornNode & { argument: AcornNode };
            if (search(restProp.argument)) return true;
          }
        }
      }

      // Array pattern: [first, second, ...rest]
      if (isArrayPattern(node)) {
        for (const element of node.elements || []) {
          if (element && search(element)) return true;
        }
      }

      // Rest element: ...variable
      if (isRestElement(node)) {
        return search(node.argument);
      }

      // Assignment pattern: variable = defaultValue
      if (isAssignmentPattern(node)) {
        return search(node.left);
      }

      return false;
    }

    return search(pattern);
  }

  /**
   * Get the indentation of a specific position in the source code
   */
  function getIndentAtPosition(pos: number): string {
    const lineStart = sourceCode.lastIndexOf('\n', pos - 1) + 1;
    const lineText = sourceCode.slice(
      lineStart,
      sourceCode.indexOf('\n', lineStart),
    );
    const match = lineText.match(/^(\s*)/);
    return match ? match[1] : '';
  }

  let transformedCode: string | null = null;
  let start = -1;
  let end = -1;

  walk(ast, (node: AcornNode) => {
    if (transformedCode !== null) return true; // Already transformed

    const startLine = positionToLine(node.start);
    const endLine = positionToLine(node.end);
    const inRange = line >= startLine && line <= endLine;

    if (!inRange) return;

    // 🟩 Arrow Function (no block) - transform to block with return
    if (isArrowFunctionExpression(node)) {
      const arrowFunc = node as ArrowFunctionExpression;

      if (!isBlockStatement(arrowFunc.body)) {
        // Check if the selected variable is used in the expression body
        // OR if it's a direct parameter (for backward compatibility)
        const param = arrowFunc.params.some(paramMatches);
        const varUsedInBody = containsVariable(arrowFunc.body, selectedVar);

        if (param || varUsedInBody) {
          const bodyStart = arrowFunc.body.start;

          // Get the actual arrow position by finding the "=>" in the source
          const nodeText = sourceCode.slice(node.start, bodyStart);
          const arrowIndex = nodeText.lastIndexOf('=>');
          const arrowEnd = node.start + arrowIndex + 2; // +2 for the length of "=>"

          // Get the original body text (from AST boundaries)
          const bodyEnd = arrowFunc.body.end;
          const bodyText = sourceCode.slice(bodyStart, bodyEnd);

          // Check for comments between arrow and body by looking at the text between arrowEnd and bodyStart
          const betweenArrowAndBody = sourceCode
            .slice(arrowEnd, bodyStart)
            .trim();
          const hasLeadingComments =
            betweenArrowAndBody.length > 0 &&
            betweenArrowAndBody !== '(' &&
            betweenArrowAndBody !== '(\n';

          let actualBodyText = bodyText;
          let hasParentheses = false;

          // Check if the body is wrapped in parentheses (common for JSX)
          const trimmedBodyText = bodyText.trim();
          if (
            trimmedBodyText.startsWith('(') &&
            trimmedBodyText.endsWith(')')
          ) {
            hasParentheses = true;
            actualBodyText = trimmedBodyText.slice(1, -1).trim();
          } else {
            // Check if parentheses are in the source after the arrow: ") => ("
            const afterArrow = sourceCode.slice(arrowEnd).trim();
            if (afterArrow.startsWith('(')) {
              // Find the matching closing parenthesis
              const fullArrowExpression = sourceCode.slice(
                arrowEnd,
                bodyEnd + 10,
              );
              if (
                fullArrowExpression.includes(')\n') ||
                fullArrowExpression.endsWith(')')
              ) {
                hasParentheses = true;
              }
            }
          }

          // If there are comments, include them in the body text
          if (hasLeadingComments) {
            // Get the full text from arrow to the end of the arrow function to capture comments
            const fullTextFromArrow = sourceCode
              .slice(arrowEnd, node.end)
              .trim();

            // Remove trailing parenthesis and whitespace for functions like "=> ( JSX )"
            const textWithoutTrailingParen = fullTextFromArrow.endsWith(')')
              ? fullTextFromArrow.slice(0, -1).trim()
              : fullTextFromArrow;

            // Remove leading parenthesis if present
            if (textWithoutTrailingParen.startsWith('(')) {
              hasParentheses = true;
              actualBodyText = textWithoutTrailingParen.slice(1).trim();
            } else {
              actualBodyText = textWithoutTrailingParen;
            }
          }

          const indent = getIndentAtPosition(node.start);
          const bodyIndent = indent + ' '.repeat(options.tabSize);

          // Extract everything before the arrow, then add the arrow
          const beforeArrow = sourceCode.slice(node.start, arrowEnd);

          // Build the new block body
          let returnStatement;

          if (hasParentheses) {
            // Only wrap in parentheses if they were originally present
            const indentedBodyText = actualBodyText
              .split('\n')
              .map((line, index) => (index === 0 ? line : `  ${line}`))
              .join('\n');
            returnStatement = `return (\n${bodyIndent}  ${indentedBodyText}\n${bodyIndent});`;
          } else {
            returnStatement = `return ${actualBodyText};`;
          }

          const newBody = ` {\n${bodyIndent}${normalized}\n${bodyIndent}${returnStatement}\n${indent}}`;

          transformedCode = beforeArrow + newBody;
          start = node.start;
          end = node.end;
          return true;
        }
      }
    }

    // 🟩 Empty Function Declaration
    if (isFunctionDeclaration(node)) {
      const funcDecl = node as FunctionDeclaration;

      if (
        funcDecl.body &&
        isBlockStatement(funcDecl.body) &&
        funcDecl.body.body.length === 0 &&
        funcDecl.params.some(paramMatches)
      ) {
        const indent = getIndentAtPosition(node.start);
        const bodyIndent = indent + ' '.repeat(options.tabSize);

        // Extract everything before the body
        const beforeBody = sourceCode.slice(node.start, funcDecl.body.start);

        // Build the new block body
        const newBody = `{\n${bodyIndent}${normalized}\n${indent}}`;

        transformedCode = beforeBody + newBody;
        start = node.start;
        end = node.end;
        return true;
      }
    }

    // 🟩 Empty Constructor/Method Declaration
    if (isMethodDefinition(node)) {
      const methodDef = node as MethodDefinition;
      const funcValue = methodDef.value as FunctionExpression;

      if (
        funcValue &&
        funcValue.body &&
        isBlockStatement(funcValue.body) &&
        funcValue.body.body.length === 0 &&
        funcValue.params.some(paramMatches)
      ) {
        const indent = getIndentAtPosition(node.start);
        const bodyIndent = indent + ' '.repeat(options.tabSize);

        // Extract everything before the body
        const beforeBody = sourceCode.slice(node.start, funcValue.body.start);

        // Build the new block body
        const newBody = `{\n${bodyIndent}${normalized}\n${indent}}`;

        transformedCode = beforeBody + newBody;
        start = node.start;
        end = node.end;
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
