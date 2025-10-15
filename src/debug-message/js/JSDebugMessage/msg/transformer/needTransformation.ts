import { TextDocument } from 'vscode';
import {
  walk,
  isArrowFunctionExpression,
  isBlockStatement,
  isFunctionDeclaration,
  isMethodDefinition,
  isIdentifier,
  type AcornNode,
  type ArrowFunctionExpression,
  type FunctionDeclaration,
  type FunctionExpression,
  type MethodDefinition,
  type BlockStatement,
  type Identifier,
} from '../acorn-utils';
import { containsVariable } from './helpers';

export function needTransformation(
  ast: AcornNode,
  document: TextDocument,
  line: number,
  selectedVar: string,
): boolean {
  const sourceCode = document.getText();

  if (!ast) {
    return false;
  }

  let transformationNeeded = false;
  let foundInArrowWithBlock = false;

  function positionToLine(pos: number) {
    // Convert offset to line (for fuzzy checks)
    const before = sourceCode.slice(0, pos);
    return before.split('\n').length - 1;
  }

  /**
   * Helper to check if a parameter matches the selected variable name.
   * Handles both regular parameters and TypeScript parameter properties.
   */
  function paramMatches(param: AcornNode): boolean {
    // Regular identifier parameter
    if (isIdentifier(param) && (param as Identifier).name === selectedVar) {
      return true;
    }

    // TypeScript parameter property (e.g., `protected firstDependency: Type`)
    // These have type 'TSParameterProperty' with a 'parameter' field containing the identifier
    if (param.type === 'TSParameterProperty') {
      const tsParam = param as { parameter?: AcornNode };
      if (tsParam.parameter && isIdentifier(tsParam.parameter)) {
        return (tsParam.parameter as Identifier).name === selectedVar;
      }
    }

    return false;
  }

  // Collect all arrow functions that contain our variable, then find the most specific one
  const candidateArrowFunctions: Array<{
    node: ArrowFunctionExpression;
    startLine: number;
    endLine: number;
    param: AcornNode | undefined;
    varUsedInBody: boolean;
  }> = [];

  walk(ast, (node: AcornNode) => {
    // Handle arrow functions
    if (isArrowFunctionExpression(node)) {
      const arrowFunc = node as ArrowFunctionExpression;
      const startLine = positionToLine(arrowFunc.start);
      const endLine = positionToLine(arrowFunc.end);

      // Check if the selection line is within this arrow function
      if (line >= startLine && line <= endLine) {
        const param = arrowFunc.params.find(paramMatches);
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
    }

    // Handle empty function declarations
    if (isFunctionDeclaration(node)) {
      const funcDecl = node as FunctionDeclaration;

      if (funcDecl.body && isBlockStatement(funcDecl.body)) {
        const blockBody = funcDecl.body as BlockStatement;

        // Check if function body is empty
        if (blockBody.body.length === 0) {
          const param = funcDecl.params.find(paramMatches);
          if (param) {
            const startLine = positionToLine(funcDecl.start);
            const endLine = positionToLine(funcDecl.end);
            if (line >= startLine && line <= endLine) {
              transformationNeeded = true;
              return true; // Stop walking
            }
          }
        }
      }
    }

    // Handle empty method declarations and constructors
    if (isMethodDefinition(node)) {
      const methodDef = node as MethodDefinition;
      const funcValue = methodDef.value as FunctionExpression;

      if (funcValue && funcValue.body && isBlockStatement(funcValue.body)) {
        const blockBody = funcValue.body as BlockStatement;

        // Check if method body is empty
        if (blockBody.body.length === 0) {
          const param = funcValue.params.find(paramMatches);
          if (param) {
            const startLine = positionToLine(methodDef.start);
            const endLine = positionToLine(methodDef.end);
            if (line >= startLine && line <= endLine) {
              transformationNeeded = true;
              return true; // Stop walking
            }
          }
        }
      }
    }
  });

  // Process arrow function candidates - find the most specific one
  if (candidateArrowFunctions.length > 0) {
    const mostSpecific = candidateArrowFunctions.reduce((smallest, current) => {
      const smallestSpan = smallest.endLine - smallest.startLine;
      const currentSpan = current.endLine - current.startLine;
      return currentSpan < smallestSpan ? current : smallest;
    });

    const { node: arrowFunc, param, varUsedInBody } = mostSpecific;

    // Now apply transformation logic to the most specific arrow function
    if (!isBlockStatement(arrowFunc.body)) {
      // Expression body - needs transformation
      transformationNeeded = true;
    } else {
      // Arrow function already has a block body
      // If the variable is a parameter of this function, no transformation needed
      if (param) {
        foundInArrowWithBlock = true;
      } else if (varUsedInBody) {
        // Variable is used in the body - check if it's a real curly brace block
        const bodyStart = arrowFunc.body.start;
        const charAtStart =
          bodyStart !== undefined ? sourceCode.charAt(bodyStart) : '';

        if (charAtStart === '{') {
          // Real block body - no transformation needed
          foundInArrowWithBlock = true;
        } else {
          // Not a real block (JSX in parentheses) - allow transformation
          transformationNeeded = true;
        }
      }
    }
  }

  // If we found the variable inside an arrow function that already has a block,
  // then no transformation is needed regardless of other findings
  if (foundInArrowWithBlock) {
    return false;
  }

  return transformationNeeded;
}
