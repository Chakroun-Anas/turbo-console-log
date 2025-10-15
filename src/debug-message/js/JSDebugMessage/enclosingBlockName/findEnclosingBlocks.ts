import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isClassDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
  isArrowFunctionExpression,
  isMethodDefinition,
  isVariableDeclarator,
} from '../msg/acorn-utils';

/**
 * Finds both the enclosing class and function names in a SINGLE AST traversal.
 * This is more efficient than calling enclosingBlockName twice.
 * @param ast The pre-parsed AST
 * @param document The text document
 * @param selectionLine The line number to find enclosing blocks for
 * @returns Object with className and functionName
 */
export function findEnclosingBlocks(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
): { className: string; functionName: string } {
  if (!ast) {
    return { className: '', functionName: '' };
  }

  interface Match {
    name: string;
    depth: number;
  }

  let bestClassMatch: Match | null = null;
  let bestFunctionMatch: Match | null = null;

  function visitWithDepth(
    node: AcornNode,
    depth: number = 0,
    parent?: AcornNode,
  ) {
    const startLine = document.positionAt(node.start).line;
    const endLine = document.positionAt(node.end).line;

    const isInside = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInside) {
      return; // Early exit - don't traverse children
    }

    // Check for class declarations
    if (isClassDeclaration(node)) {
      const classNode = node as unknown as { id?: AcornNode };
      if (classNode.id && isIdentifier(classNode.id)) {
        const candidateName = (classNode.id as { name: string }).name;
        if (!bestClassMatch || depth > bestClassMatch.depth) {
          bestClassMatch = { name: candidateName, depth };
        }
      }
    }

    // Check for function-like nodes
    let functionCandidateName: string | null = null;

    if (
      isFunctionDeclaration(node) ||
      isFunctionExpression(node) ||
      isArrowFunctionExpression(node)
    ) {
      const funcNode = node as unknown as { id?: AcornNode };
      if (funcNode.id && isIdentifier(funcNode.id)) {
        functionCandidateName = (funcNode.id as { name: string }).name;
      } else if (parent && isVariableDeclarator(parent)) {
        // Arrow function or function expression assigned to a variable
        const varNode = parent as unknown as { id: AcornNode };
        if (isIdentifier(varNode.id)) {
          functionCandidateName = (varNode.id as { name: string }).name;
        }
      }
    } else if (isMethodDefinition(node)) {
      const methodNode = node as unknown as { key: AcornNode; kind: string };
      if (methodNode.kind === 'constructor') {
        functionCandidateName = 'constructor';
      } else if (isIdentifier(methodNode.key)) {
        functionCandidateName = (methodNode.key as { name: string }).name;
      }
    }

    if (
      functionCandidateName &&
      (!bestFunctionMatch || depth > bestFunctionMatch.depth)
    ) {
      bestFunctionMatch = { name: functionCandidateName, depth };
    }

    // Manually walk children to avoid infinite recursion
    for (const key in node) {
      if (
        key === 'type' ||
        key === 'start' ||
        key === 'end' ||
        key === 'loc' ||
        key === 'parent'
      ) {
        continue;
      }

      const value = (node as unknown as Record<string, unknown>)[key];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'type' in item) {
            visitWithDepth(item as AcornNode, depth + 1, node);
          }
        }
      } else if (value && typeof value === 'object' && 'type' in value) {
        visitWithDepth(value as AcornNode, depth + 1, node);
      }
    }
  }

  visitWithDepth(ast);

  return {
    className: (bestClassMatch as Match | null)?.name ?? '',
    functionName: (bestFunctionMatch as Match | null)?.name ?? '',
  };
}
