import type { TextDocument } from 'vscode';
import { BlockType } from '@/entities';
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
 * Finds the enclosing block (class or function) name for a given line in PHP code.
 * @param ast The pre-parsed PHP AST (to avoid re-parsing)
 * @param document The text document
 * @param selectionLine The line number to find the enclosing block for
 * @param blockType The type of block to find ('class' or 'function')
 * @returns The name of the enclosing block, or empty string if not found
 */
export function enclosingBlockName(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  blockType: BlockType,
): string {
  if (!ast) {
    return '';
  }

  interface Match {
    name: string;
    depth: number;
  }

  let bestMatch: Match | null = null;

  function visitWithDepth(node: PHPNode, depth: number = 0) {
    if (!node || !node.loc) {
      return;
    }

    const startLine = node.loc.start.line - 1; // php-parser uses 1-based lines
    const endLine = node.loc.end.line - 1;

    const isInside = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInside) {
      return; // Don't traverse children if selection is not inside this node
    }

    let candidateName: string | null = null;

    // Check for class declarations
    if (blockType === 'class' && isClass(node)) {
      const classNode = node as Class;
      if (classNode.name && isIdentifier(classNode.name)) {
        candidateName = classNode.name.name;
      }
    }

    // Check for function-like nodes
    if (blockType === 'function') {
      if (isFunction(node)) {
        const funcNode = node as Function;
        if (funcNode.name && isIdentifier(funcNode.name)) {
          candidateName = funcNode.name.name;
        }
      } else if (isMethod(node)) {
        const methodNode = node as Method;
        if (methodNode.name && isIdentifier(methodNode.name)) {
          candidateName = methodNode.name.name;
        }
        // Check if it's a constructor by name (PHP uses __construct)
        if (candidateName === '__construct') {
          candidateName = '__construct';
        }
      } else if (isClosure(node) || isArrowFunc(node)) {
        // Anonymous functions - we could use a placeholder like '(anonymous)'
        // but for now we'll skip them unless they're assigned to a variable
        // (which would require checking the parent node)
        candidateName = null;
      }
    }

    if (candidateName && (!bestMatch || depth > bestMatch.depth)) {
      bestMatch = { name: candidateName, depth };
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

  return (bestMatch as Match | null)?.name ?? '';
}
