import type { TextDocument } from 'vscode';
import {
  type PHPNode,
  type Program,
  type Class,
  type Function,
  type Method,
  isClass,
  isFunction,
  isMethod,
  isClosure,
  isArrowFunc,
  isIdentifier,
} from '../msg/php-parser-utils';

/**
 * Finds both the enclosing class and function names in a SINGLE AST traversal.
 * This is more efficient than calling enclosingBlockName twice.
 * @param ast The pre-parsed PHP AST
 * @param document The text document
 * @param selectionLine The line number to find enclosing blocks for
 * @returns Object with className and functionName
 */
export function findEnclosingBlocks(
  ast: Program,
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

  function visitWithDepth(node: PHPNode, depth: number = 0) {
    if (!node || !node.loc) {
      return;
    }

    const startLine = node.loc.start.line - 1; // php-parser uses 1-based lines
    const endLine = node.loc.end.line - 1;

    const isInside = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInside) {
      return; // Early exit - don't traverse children
    }

    // Check for class declarations
    if (isClass(node)) {
      const classNode = node as Class;
      if (classNode.name && isIdentifier(classNode.name)) {
        const candidateName = classNode.name.name;
        if (!bestClassMatch || depth > bestClassMatch.depth) {
          bestClassMatch = { name: candidateName, depth };
        }
      }
    }

    // Check for function-like nodes
    let functionCandidateName: string | null = null;

    if (isFunction(node)) {
      const funcNode = node as Function;
      if (funcNode.name && isIdentifier(funcNode.name)) {
        functionCandidateName = funcNode.name.name;
      }
    } else if (isMethod(node)) {
      const methodNode = node as Method;
      if (methodNode.name && isIdentifier(methodNode.name)) {
        functionCandidateName = methodNode.name.name;
      }
    } else if (isClosure(node) || isArrowFunc(node)) {
      // Skip anonymous functions unless they're assigned to a variable
      functionCandidateName = null;
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
        key === 'kind' ||
        key === 'loc' ||
        key === 'errors' ||
        key === 'comments'
      ) {
        continue;
      }

      const value = (node as unknown as Record<string, unknown>)[key];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'kind' in item) {
            visitWithDepth(item as PHPNode, depth + 1);
          }
        }
      } else if (value && typeof value === 'object' && 'kind' in value) {
        visitWithDepth(value as PHPNode, depth + 1);
      }
    }
  }

  visitWithDepth(ast);

  return {
    className: (bestClassMatch as Match | null)?.name ?? '',
    functionName: (bestFunctionMatch as Match | null)?.name ?? '',
  };
}
