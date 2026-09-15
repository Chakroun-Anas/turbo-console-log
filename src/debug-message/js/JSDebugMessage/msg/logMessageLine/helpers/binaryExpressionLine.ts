import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isBinaryExpression,
  isLogicalExpression,
  isIdentifier,
  isExpressionStatement,
  isAssignmentExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  isParenthesizedExpression,
  findBindingDeclaration,
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

  // Declarations: after the whole statement (a declarator list continues
  // past the first initializer).
  const declaration = findBindingDeclaration(ast, selectionLine, variableName);
  if (declaration) {
    return document.positionAt(declaration.end).line + 1;
  }

  return selectionLine + 1;
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
