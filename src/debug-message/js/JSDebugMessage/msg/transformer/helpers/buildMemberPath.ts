import {
  isIdentifier,
  type AcornNode,
  type Identifier,
} from '../../acorn-utils';

/**
 * Helper to build a member expression path (e.g., "item.label" from a MemberExpression node)
 */
export function buildMemberPath(node: AcornNode): string {
  if (isIdentifier(node)) {
    return (node as Identifier).name;
  }

  if (node.type === 'MemberExpression') {
    const memberExpr = node as unknown as {
      object: AcornNode;
      property: AcornNode;
      computed: boolean;
      optional?: boolean;
    };

    const objectPath = buildMemberPath(memberExpr.object);

    if (memberExpr.computed) {
      return objectPath; // Can't build path for computed properties
    }

    if (isIdentifier(memberExpr.property)) {
      const propName = (memberExpr.property as Identifier).name;
      const separator = memberExpr.optional ? '?.' : '.';
      return `${objectPath}${separator}${propName}`;
    }
  }

  // Handle ChainExpression (optional chaining wrapper)
  if (node.type === 'ChainExpression') {
    const chainExpr = node as unknown as { expression: AcornNode };
    return buildMemberPath(chainExpr.expression);
  }

  return '';
}
