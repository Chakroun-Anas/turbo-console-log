import type { AcornNode } from './types';

/**
 * Recursively walks an Acorn AST tree, calling the visitor function for each node.
 * The visitor can return true to stop traversal early.
 *
 * @param node - The AST node to start walking from
 * @param visitor - Function called for each node. Return true to stop traversal.
 */
export function walk(
  node: AcornNode,
  visitor: (node: AcornNode) => void | boolean,
): void {
  const shouldStop = visitor(node);
  if (shouldStop === true) return;

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
          walk(item as AcornNode, visitor);
        }
      }
    } else if (value && typeof value === 'object' && 'type' in value) {
      walk(value as AcornNode, visitor);
    }
  }
}
