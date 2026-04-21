import type { TextDocument } from 'vscode';
import {
  walk,
  isArrowFunc,
  isFunction,
  isMethod,
  type PHPNode,
  type ArrowFunc,
  type Function as PHPFunction,
  type Method,
  type Parameter,
} from '../php-parser-utils';
import { containsVariable } from './helpers';

/**
 * Determines if a PHP code transformation is needed before inserting a debug log.
 *
 * Transformation is needed for:
 * 1. Arrow functions (fn($x) => ...) - they need to be converted to regular functions
 * 2. Empty function declarations with the selected parameter
 * 3. Empty method declarations with the selected parameter
 *
 * @param ast - The parsed PHP AST
 * @param document - The VS Code text document
 * @param line - The line number where the variable is selected (0-based)
 * @param selectedVar - The variable name (without $ prefix)
 * @returns true if transformation is needed, false otherwise
 */
export function needTransformation(
  ast: PHPNode,
  document: TextDocument,
  line: number,
  selectedVar: string,
): boolean {
  if (!ast) {
    return false;
  }

  let transformationNeeded = false;

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

  // Track arrow functions that contain our variable
  const candidateArrowFunctions: Array<{
    node: ArrowFunc;
    startLine: number;
    endLine: number;
    param: Parameter | undefined;
    varUsedInBody: boolean;
  }> = [];

  walk(ast, (node: PHPNode) => {
    if (!node.loc) return;

    const startLine = node.loc.start.line - 1; // Convert to 0-based
    const endLine = node.loc.end.line - 1;

    // Check if the selection line is within this node
    if (line < startLine || line > endLine) return;

    // Handle arrow functions - they ALWAYS need transformation because
    // PHP arrow functions can only have single expressions
    if (isArrowFunc(node)) {
      const arrowFunc = node as ArrowFunc;

      const param = arrowFunc.arguments.find(paramMatches);
      const varUsedInBody = containsVariable(arrowFunc.body, selectedVar);

      if (param || varUsedInBody) {
        candidateArrowFunctions.push({
          node: arrowFunc,
          startLine,
          endLine,
          param,
          varUsedInBody,
        });
      }
    }

    // Handle empty function declarations
    if (isFunction(node)) {
      const funcDecl = node as PHPFunction;

      if (funcDecl.body && funcDecl.body.children.length === 0) {
        const param = funcDecl.arguments.find(paramMatches);
        if (param) {
          transformationNeeded = true;
          return true; // Stop walking
        }
      }
    }

    // Handle empty method declarations
    if (isMethod(node)) {
      const methodDef = node as Method;

      if (methodDef.body && methodDef.body.children.length === 0) {
        const param = methodDef.arguments.find(paramMatches);
        if (param) {
          transformationNeeded = true;
          return true; // Stop walking
        }
      }
    }
  });

  // Process arrow function candidates - find the most specific one
  if (candidateArrowFunctions.length > 0) {
    // Arrow functions in PHP always need transformation
    transformationNeeded = true;
  }

  return transformationNeeded;
}
