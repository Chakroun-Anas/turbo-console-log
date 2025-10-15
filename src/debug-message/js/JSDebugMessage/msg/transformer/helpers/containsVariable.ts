import {
  walk,
  isIdentifier,
  type AcornNode,
  type Identifier,
} from '../../acorn-utils';
import { buildMemberPath } from './buildMemberPath';

/**
 * Helper to check if a node (expression body) contains the selected variable or its base.
 * For example, if selectedVar is "item.label", we check for both "item.label" and "item".
 */
export function containsVariable(node: AcornNode, varName: string): boolean {
  if (!node) return false;

  // Extract base variable name if it's a property access (e.g., "item" from "item.label")
  const baseVarName = varName.split('.')[0].split('?.')[0];

  let found = false;

  walk(node, (childNode: AcornNode) => {
    if (found) return true; // Stop walking if already found

    // Check for direct identifier match
    if (isIdentifier(childNode)) {
      const name = (childNode as Identifier).name;
      if (name === varName || name === baseVarName) {
        found = true;
        return true;
      }
    }

    // Check for member expression match (e.g., item.label)
    if (childNode.type === 'MemberExpression') {
      // Build the full path
      const path = buildMemberPath(childNode);
      if (path === varName || path.startsWith(baseVarName)) {
        found = true;
        return true;
      }
    }
  });

  return found;
}
