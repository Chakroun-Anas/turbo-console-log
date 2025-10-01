import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclarator,
  type ObjectPattern,
  type ArrayPattern,
  type Property,
  isIdentifier,
  isObjectPattern,
  isArrayPattern,
  isConditionalExpression,
  isParenthesizedExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  walk,
} from '../../acorn-utils';

export function ternaryChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const wanted = variableName.trim();
  if (!wanted) return { isChecked: false };

  if (!ast) {
    return { isChecked: false };
  }

  let isChecked = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    if (node.type === 'VariableDeclarator') {
      const declarator = node as VariableDeclarator;

      // Check if selection line is within this declarator's range
      if (node.start !== undefined && node.end !== undefined) {
        const startPos = document.positionAt(node.start);
        const endPos = document.positionAt(node.end);

        if (selectionLine < startPos.line || selectionLine > endPos.line) {
          return;
        }
      }

      const id = declarator.id;
      const init = declarator.init;

      // ── ① IDENTIFIER CASE ───────────────────────────────
      if (isIdentifier(id) && id.name === wanted) {
        if (init && containsTernary(init)) {
          isChecked = true;
          return true;
        }
      }

      // ── ② DESTRUCTURING CASE ───────────────────────────
      if (isObjectPattern(id) || isArrayPattern(id)) {
        const binding = findBindingElement(id, wanted);
        if (binding) {
          // For AssignmentPattern, check the 'right' (default value)
          const right = (binding as { right?: AcornNode }).right;
          if (right && containsTernary(right)) {
            isChecked = true;
            return true;
          }
        }
      }
    }
  });

  return { isChecked };
}

/*──────────── helpers ────────────*/

interface BindingElement {
  type: 'Property' | 'RestElement' | 'AssignmentPattern';
  key?: AcornNode;
  value?: AcornNode;
  left?: AcornNode;
  right?: AcornNode;
}

function findBindingElement(
  pattern: ObjectPattern | ArrayPattern,
  wanted: string,
  visited = new Set<AcornNode>(),
  depth = 0,
): BindingElement | undefined {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `findBindingElement: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return undefined;
  }

  if (visited.has(pattern)) {
    return undefined;
  }

  visited.add(pattern);

  const elements =
    pattern.type === 'ObjectPattern'
      ? pattern.properties
      : pattern.elements || [];

  for (const el of elements) {
    if (!el) continue; // skip holes in array patterns

    // Handle RestElement
    if (el.type === 'RestElement') {
      const arg = (el as { argument?: AcornNode }).argument;
      if (arg && isIdentifier(arg) && arg.name === wanted) {
        return el as BindingElement;
      }
      continue;
    }

    // Handle Property (object destructuring)
    if (el.type === 'Property') {
      const prop = el as Property;
      const value = prop.value;

      // Check if value is an AssignmentPattern with default
      if (value && value.type === 'AssignmentPattern') {
        const left = (value as { left?: AcornNode }).left;

        // Direct match: { a = ternary }
        if (left && isIdentifier(left) && left.name === wanted) {
          return value as BindingElement;
        }

        // Nested pattern: { config: { apiKey = ternary } }
        if (left && (isObjectPattern(left) || isArrayPattern(left))) {
          const inner = findBindingElement(left, wanted, visited, depth + 1);
          if (inner) return inner;
        }
      }

      // Direct identifier match: { apiKey: key }
      if (value && isIdentifier(value) && value.name === wanted) {
        // But we need to check if there's a default in an assignment pattern
        // This handles: { apiKey: key = ternary }
        return el as BindingElement;
      }

      // Nested pattern without default: { config: { apiKey } }
      if (value && (isObjectPattern(value) || isArrayPattern(value))) {
        const inner = findBindingElement(value, wanted, visited, depth + 1);
        if (inner) return inner;
      }
    }

    // Handle AssignmentPattern (array destructuring with defaults)
    if (el.type === 'AssignmentPattern') {
      const left = (el as { left?: AcornNode }).left;

      // Direct match: [x = ternary]
      if (left && isIdentifier(left) && left.name === wanted) {
        return el as BindingElement;
      }

      // Nested pattern: [[x = ternary]]
      if (left && (isObjectPattern(left) || isArrayPattern(left))) {
        const inner = findBindingElement(left, wanted, visited, depth + 1);
        if (inner) return inner;
      }
    }

    // Handle Identifier (simple destructuring without default)
    if (isIdentifier(el) && el.name === wanted) {
      return { type: 'Property', value: el } as BindingElement;
    }
  }

  return undefined;
}

function containsTernary(
  node: AcornNode,
  visited = new Set<AcornNode>(),
  depth = 0,
): boolean {
  if (!node) return false;

  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `containsTernary: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  if (visited.has(node)) {
    return false;
  }

  visited.add(node);

  // Unwrap parentheses and type assertions
  if (
    isParenthesizedExpression(node) ||
    isTSAsExpression(node) ||
    isTSTypeAssertion(node)
  ) {
    const expr = (node as { expression?: AcornNode }).expression;
    if (expr) return containsTernary(expr, visited, depth + 1);
  }

  // Found a ternary!
  if (isConditionalExpression(node)) return true;

  // Recursively check children
  let hasTernary = false;
  walk(node, (child: AcornNode) => {
    if (hasTernary) return true; // early exit
    if (child !== node && isConditionalExpression(child)) {
      hasTernary = true;
      return true;
    }
  });

  return hasTernary;
}
