import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isFunctionDeclaration,
  isFunctionExpression,
  isArrowFunctionExpression,
  isMethodDefinition,
  isClassMethod,
  isBlockStatement,
  walk,
} from '../../acorn-utils';

/**
 * Determines the appropriate line to insert a log
 * for a function parameter.
 */
export function functionParameterLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Find the parameter node that matches our variable name and is on the selection line
  const parameterNode = findParameterNodeOnLine(
    ast,
    selectionLine,
    variableName,
    document,
  );
  if (!parameterNode) return selectionLine + 1;

  // Find the function that contains this parameter
  const func = findContainingFunction(ast, parameterNode);
  if (!func) return selectionLine + 1;

  const body = (func as { body?: AcornNode }).body;
  if (body && isBlockStatement(body)) {
    const bracePos = document.positionAt(body.start!);
    const braceLine = bracePos.line;
    const braceLineText = document.lineAt(braceLine).text;

    const inlineEmpty = /\{\s*\}/.test(braceLineText);
    if (inlineEmpty) return braceLine + 1;

    const braceAtLineEnd = braceLineText.trim().endsWith('{');
    const target = braceAtLineEnd ? braceLine + 1 : braceLine;

    return Math.min(target, document.lineCount - 1);
  }

  // Concise arrow function with single expression — fallback
  return selectionLine + 1;
}

/*──────────── helpers ────────────*/

function findParameterNodeOnLine(
  root: AcornNode,
  selectionLine: number,
  variableName: string,
  document: TextDocument,
): AcornNode | null {
  let foundParameter: AcornNode | null = null;

  walk(root, (node: AcornNode): boolean | void => {
    // Check if this node is a parameter identifier that matches our criteria
    if (
      isIdentifier(node) &&
      (node as { name: string }).name === variableName
    ) {
      if (node.start === undefined) return;

      const nodePos = document.positionAt(node.start);
      if (nodePos.line === selectionLine) {
        // Check if this identifier is part of a function parameter
        // We need to verify this is within a parameter context
        if (isWithinParameter(root, node)) {
          foundParameter = node;
          return true; // Stop walking
        }
      }
    }
  });

  return foundParameter;
}

function isWithinParameter(root: AcornNode, targetNode: AcornNode): boolean {
  // Walk the tree to find if targetNode is within a function's params array
  let isParam = false;

  walk(root, (node: AcornNode): boolean | void => {
    if (isFunctionLike(node)) {
      const params = (node as { params?: AcornNode[] }).params;
      if (params) {
        for (const param of params) {
          if (containsNode(param, targetNode)) {
            isParam = true;
            return true; // Stop walking
          }
        }
      }
    }
  });

  return isParam;
}

function containsNode(parent: AcornNode, target: AcornNode): boolean {
  if (parent === target) return true;

  let found = false;
  walk(parent, (node: AcornNode): boolean | void => {
    if (
      node === target ||
      (node.start === target.start &&
        node.end === target.end &&
        node.type === target.type)
    ) {
      found = true;
      return true; // Stop walking
    }
  });

  return found;
}

function findContainingFunction(
  root: AcornNode,
  paramNode: AcornNode,
): AcornNode | null {
  let containingFunc: AcornNode | null = null;

  walk(root, (node: AcornNode): boolean | void => {
    if (isFunctionLike(node)) {
      const params = (node as { params?: AcornNode[] }).params;
      if (params) {
        for (const param of params) {
          if (containsNode(param, paramNode)) {
            containingFunc = node;
            return true; // Stop walking
          }
        }
      }
    }
  });

  return containingFunc;
}

function isFunctionLike(node: AcornNode): boolean {
  return (
    isFunctionDeclaration(node) ||
    isFunctionExpression(node) ||
    isArrowFunctionExpression(node) ||
    isMethodDefinition(node) ||
    isClassMethod(node)
  );
}
