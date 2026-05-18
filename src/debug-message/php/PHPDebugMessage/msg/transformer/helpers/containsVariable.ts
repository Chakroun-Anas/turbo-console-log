import {
  walk,
  isVariable,
  type PHPNode,
  type Variable,
} from '../../php-parser-utils';
import { buildMemberPath } from './buildMemberPath';

/**
 * Helper to check if a node contains the selected variable or its base.
 * For PHP variables like $item->label, we check for both "$item->label" and "$item".
 *
 * @param node - The PHP AST node to search within
 * @param varName - The variable name to search for (without the $ prefix)
 * @returns true if the variable is found within the node
 */
export function containsVariable(node: PHPNode, varName: string): boolean {
  if (!node) return false;

  // Extract base variable name if it's a property/array access
  // e.g., "item->label" or "item['key']" becomes "item"
  const baseVarName = varName.split('->')[0].split('[')[0];

  let found = false;

  walk(node, (childNode: PHPNode) => {
    if (found) return true; // Stop walking if already found

    // Check for direct variable match
    if (isVariable(childNode)) {
      const varNode = childNode as Variable;
      if (typeof varNode.name === 'string') {
        const name = varNode.name;
        if (name === varName || name === baseVarName) {
          found = true;
          return true;
        }
      }
    }

    // Check for property lookup match ($obj->prop)
    if (childNode.kind === 'propertylookup') {
      const path = buildMemberPath(childNode);
      if (path === varName || path.startsWith(baseVarName)) {
        found = true;
        return true;
      }
    }

    // Check for array access match ($arr['key'])
    if (childNode.kind === 'offsetlookup') {
      const path = buildMemberPath(childNode);
      if (path === varName || path.startsWith(baseVarName)) {
        found = true;
        return true;
      }
    }
  });

  return found;
}
