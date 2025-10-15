import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  isIdentifier,
  isObjectPattern,
  isProperty,
  isRestElement,
  walk,
} from '../../acorn-utils';

/**
 * Recursively searches for a variable name within a destructuring pattern.
 * Handles nested destructuring like: const { props: { children } } = this;
 */
function findVariableInPattern(
  pattern: AcornNode,
  variableName: string,
  visited: Set<AcornNode> = new Set(),
  depth = 0,
): boolean {
  // Safety: prevent infinite recursion
  const MAX_DEPTH = 1000; // Generous max depth for deeply nested destructuring
  if (depth >= MAX_DEPTH) {
    console.warn(
      `findVariableInPattern: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  // Safety: prevent circular references
  if (visited.has(pattern)) {
    return false;
  }

  if (!isObjectPattern(pattern)) return false;

  visited.add(pattern);

  // TypeScript types ObjectPattern.properties as Property[], but runtime can include RestElement
  const properties = (pattern as { properties: AcornNode[] }).properties;

  for (const prop of properties) {
    // Handle Property nodes: { key: value } or { children }
    if (isProperty(prop)) {
      const value = prop.value;

      // Direct match: { children }
      if (
        isIdentifier(value) &&
        (value as { name: string }).name === variableName
      ) {
        return true;
      }

      // Nested destructuring: { props: { children } }
      if (isObjectPattern(value)) {
        if (findVariableInPattern(value, variableName, visited, depth + 1)) {
          return true;
        }
      }
    }
    // Handle RestElement: { ...rest }
    else if (isRestElement(prop)) {
      const argument = prop.argument;
      if (
        isIdentifier(argument) &&
        (argument as { name: string }).name === variableName
      ) {
        return true;
      }
    }
  }

  return false;
}

export function primitiveAssignmentLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let line = selectionLine + 1;

  walk(ast, (node: AcornNode): void => {
    if (node.type === 'VariableDeclaration') {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        // Handle identifier-based declarations: const x = value
        if (
          isIdentifier(decl.id) &&
          (decl.id as { name: string }).name === variableName &&
          decl.init
        ) {
          if (node.start === undefined || node.end === undefined) continue;

          const start = document.positionAt(node.start).line;
          const end = document.positionAt(node.end).line;
          if (selectionLine < start || selectionLine > end) continue;

          if (decl.init.end === undefined) continue;
          const endLine = document.positionAt(decl.init.end).line;
          line = endLine + 1;
        }

        // Handle object destructuring (including nested): const { user } = state or const { props: { children } } = this
        if (isObjectPattern(decl.id)) {
          if (findVariableInPattern(decl.id, variableName) && decl.init) {
            if (node.start === undefined || node.end === undefined) continue;

            const start = document.positionAt(node.start).line;
            const end = document.positionAt(node.end).line;
            if (selectionLine < start || selectionLine > end) continue;

            if (decl.init.end === undefined) continue;
            const endLine = document.positionAt(decl.init.end).line;
            line = endLine + 1;
          }
        }
      }
    }
  });

  return line;
}
