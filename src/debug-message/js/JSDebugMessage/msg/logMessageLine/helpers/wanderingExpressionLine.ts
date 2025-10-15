import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

export function wanderingExpressionLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const code = document.getText();

  // Set up parent relationships
  function setParents(
    node: AcornNode,
    parent?: AcornNode,
    visited = new Set<AcornNode>(),
    depth = 0,
  ): void {
    // Safeguards against infinite recursion
    const MAX_DEPTH = 1000;

    if (depth >= MAX_DEPTH) {
      console.warn(
        `setParents: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
      );
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);

    if (parent) {
      (node as { parent?: AcornNode }).parent = parent;
    }

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
            setParents(item as AcornNode, node, visited, depth + 1);
          }
        }
      } else if (value && typeof value === 'object' && 'type' in value) {
        setParents(value as AcornNode, node, visited, depth + 1);
      }
    }
  }

  setParents(ast);

  let bestEndOffset = -1;

  function isDeclaration(node: AcornNode): boolean {
    const parent = (node as { parent?: AcornNode }).parent;
    if (!parent) return false;

    // Check if this is the 'id' (name) part of a VariableDeclarator
    if (parent.type === 'VariableDeclarator') {
      const decl = parent as unknown as { id: AcornNode };
      return decl.id === node;
    }

    // Check if this is a function/method parameter name
    if (
      parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ArrowFunctionExpression' ||
      parent.type === 'MethodDefinition' ||
      parent.type === 'ClassMethod'
    ) {
      const func = parent as unknown as { params?: AcornNode[] };
      return func.params?.includes(node) ?? false;
    }

    // Check if this is the key part of a Property assignment
    if (parent.type === 'Property') {
      const prop = parent as unknown as { key: AcornNode };
      return prop.key === node;
    }

    return false;
  }

  function containsVariableName(node: AcornNode): boolean {
    // Direct identifier match
    if (
      isIdentifier(node) &&
      (node as { name: string }).name === variableName
    ) {
      return true;
    }

    // Property access expression that ends with variableName
    if (isMemberExpression(node)) {
      const nodeText = code.substring(node.start, node.end);
      return nodeText.endsWith(variableName);
    }

    return false;
  }

  walk(ast, (node: AcornNode): void => {
    const startLine = document.positionAt(node.start).line;
    const endLine = document.positionAt(node.end).line;

    const isInRange = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInRange) {
      return;
    }

    // If this node contains the variable and isn't a declaration
    if (containsVariableName(node) && !isDeclaration(node)) {
      // Climb up to the outermost expression if possible
      let top: AcornNode = node;
      let parent = (top as { parent?: AcornNode }).parent;
      const visited = new Set<AcornNode>();
      let depth = 0;
      const MAX_DEPTH = 1000;

      while (parent && parent.start === node.start && parent.end >= node.end) {
        // Safeguards against infinite loops
        if (depth >= MAX_DEPTH) {
          console.warn(
            `wanderingExpressionLine: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
          );
          break;
        }
        if (visited.has(parent)) {
          break;
        }
        visited.add(parent);
        depth++;

        top = parent;
        parent = (top as { parent?: AcornNode }).parent;
      }

      const topEndOffset = top.end;
      if (topEndOffset > bestEndOffset) {
        bestEndOffset = topEndOffset;
      }
    }
  });

  if (bestEndOffset === -1) return selectionLine + 1;

  const line = document.positionAt(bestEndOffset).line;
  return line + 1;
}
