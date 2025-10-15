import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclarator,
  isBinaryExpression,
  isLogicalExpression,
  isIdentifier,
  isExpressionStatement,
  isAssignmentExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  isParenthesizedExpression,
  walk,
} from '../../acorn-utils';

export function binaryExpressionLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Try to locate assignment expression first (prioritize selection line context)
  const assignment = findAssignmentExpression(
    ast,
    variableName,
    selectionLine,
    document,
  );
  if (assignment) {
    return calculateMaxEndLine(document, assignment);
  }

  // Try to locate the VariableDeclarator as fallback
  const decl = findVariableDeclarator(ast, variableName);
  if (decl && decl.init) {
    const root = unwrap(decl.init);
    if (isBinaryExpression(root) || isLogicalExpression(root)) {
      return calculateMaxEndLine(document, root);
    }
  }

  return selectionLine + 1;
}

function unwrap(
  node: AcornNode,
  visited = new Set<AcornNode>(),
  depth = 0,
): AcornNode {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `unwrap: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return node;
  }

  if (visited.has(node)) {
    return node;
  }

  visited.add(node);

  if (isParenthesizedExpression(node) || isTSAsExpression(node)) {
    return unwrap(
      (node as { expression: AcornNode }).expression,
      visited,
      depth + 1,
    );
  }
  if (isTSTypeAssertion(node)) {
    return unwrap(
      (node as { expression: AcornNode }).expression,
      visited,
      depth + 1,
    );
  }
  return node;
}

function findVariableDeclarator(
  root: AcornNode,
  name: string,
): VariableDeclarator | undefined {
  let found: VariableDeclarator | undefined;

  walk(root, (node: AcornNode): boolean | void => {
    if (found) return true;

    if (node.type === 'VariableDeclarator') {
      const varDecl = node as VariableDeclarator;
      if (isIdentifier(varDecl.id) && varDecl.id.name === name) {
        found = varDecl;
        return true;
      }
    }
  });

  return found;
}

function findAssignmentExpression(
  root: AcornNode,
  variableName: string,
  selectionLine: number,
  document: TextDocument,
): AcornNode | undefined {
  let found: AcornNode | undefined;

  walk(root, (node: AcornNode): boolean | void => {
    if (found) return true;

    if (isExpressionStatement(node)) {
      if (node.start === undefined || node.end === undefined) return;

      const start = document.positionAt(node.start).line;
      const end = document.positionAt(node.end).line;
      if (selectionLine < start || selectionLine > end) return;

      const expr = (node as { expression?: AcornNode }).expression;
      if (expr && isAssignmentExpression(expr)) {
        const assignment = expr as {
          operator: string;
          left?: AcornNode;
          right?: AcornNode;
        };
        if (assignment.operator === '=') {
          if (
            assignment.left &&
            isIdentifier(assignment.left) &&
            assignment.left.name === variableName
          ) {
            if (assignment.right && containsBinaryOrLogical(assignment.right)) {
              found = assignment.right;
              return true;
            }
          }
        }
      }
    }
  });

  return found;
}

function calculateMaxEndLine(document: TextDocument, root: AcornNode): number {
  let maxEndLine = 0;

  walk(root, (node: AcornNode) => {
    if (node.end !== undefined) {
      const line = document.positionAt(node.end).line;
      if (line > maxEndLine) maxEndLine = line;
    }
  });

  return maxEndLine + 1;
}

function containsBinaryOrLogical(
  node: AcornNode,
  visited = new Set<AcornNode>(),
  depth = 0,
): boolean {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `containsBinaryOrLogical: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  if (visited.has(node)) {
    return false;
  }

  visited.add(node);

  if (
    isParenthesizedExpression(node) ||
    isTSAsExpression(node) ||
    isTSTypeAssertion(node)
  ) {
    return containsBinaryOrLogical(
      (node as { expression: AcornNode }).expression,
      visited,
      depth + 1,
    );
  }

  if (isBinaryExpression(node) || isLogicalExpression(node)) return true;

  // Check if any child contains binary or logical expression
  let hasBinaryOrLogical = false;
  walk(node, (child: AcornNode): boolean | void => {
    if (hasBinaryOrLogical) return true;
    if (
      child !== node &&
      (isBinaryExpression(child) || isLogicalExpression(child))
    ) {
      hasBinaryOrLogical = true;
      return true;
    }
  });

  return hasBinaryOrLogical;
}
