import { TextDocument } from 'vscode';
import { BlockType } from '@/entities';
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
 * Finds the enclosing block (class or function) name for a given line.
 * @param ast The pre-parsed AST (to avoid re-parsing)
 * @param document The text document
 * @param selectionLine The line number to find the enclosing block for
 * @param blockType The type of block to find ('class' or 'function')
 * @returns The name of the enclosing block, or empty string if not found
 */
export function enclosingBlockName(
  ast: AcornNode,
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

  function visitWithDepth(
    node: AcornNode,
    depth: number = 0,
    parent?: AcornNode,
  ) {
    const startLine = document.positionAt(node.start).line;
    const endLine = document.positionAt(node.end).line;

    const isInside = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInside) {
      return; // Don't traverse children if selection is not inside this node
    }

    let candidateName: string | null = null;

    // Check for class declarations
    if (blockType === 'class' && isClassDeclaration(node)) {
      const classNode = node as unknown as { id?: AcornNode };
      if (classNode.id && isIdentifier(classNode.id)) {
        candidateName = (classNode.id as { name: string }).name;
      }
    }

    // Check for function-like nodes
    if (blockType === 'function') {
      if (
        isFunctionDeclaration(node) ||
        isFunctionExpression(node) ||
        isArrowFunctionExpression(node)
      ) {
        const funcNode = node as unknown as { id?: AcornNode };
        if (funcNode.id && isIdentifier(funcNode.id)) {
          candidateName = (funcNode.id as { name: string }).name;
        } else if (parent && isVariableDeclarator(parent)) {
          // Arrow function or function expression assigned to a variable
          const varNode = parent as unknown as { id: AcornNode };
          if (isIdentifier(varNode.id)) {
            candidateName = (varNode.id as { name: string }).name;
          }
        }
      } else if (isMethodDefinition(node)) {
        const methodNode = node as unknown as { key: AcornNode; kind: string };
        if (methodNode.kind === 'constructor') {
          candidateName = 'constructor';
        } else if (isIdentifier(methodNode.key)) {
          candidateName = (methodNode.key as { name: string }).name;
        }
      }
    }

    if (candidateName && (!bestMatch || depth > bestMatch.depth)) {
      bestMatch = { name: candidateName, depth };
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

  return (bestMatch as Match | null)?.name ?? '';
}
