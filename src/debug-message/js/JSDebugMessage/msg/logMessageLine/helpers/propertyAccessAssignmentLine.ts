import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  isIdentifier,
  isMemberExpression,
  isTSAsExpression,
  isParenthesizedExpression,
  isExpressionStatement,
  isAssignmentExpression,
  walk,
} from '../../acorn-utils';

export function propertyAccessAssignmentLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let insertionLine = selectionLine + 1;
  const code = document.getText();

  walk(ast, (node: AcornNode): void => {
    // Case 1: const foo = obj.prop;
    if (node.type === 'VariableDeclaration') {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        if (
          isIdentifier(decl.id) &&
          (decl.id as { name: string }).name === variableName &&
          decl.init
        ) {
          if (node.start === undefined || node.end === undefined) continue;

          const nodeStart = document.positionAt(node.start).line;
          const nodeEnd = document.positionAt(node.end).line;
          if (selectionLine < nodeStart || selectionLine > nodeEnd) continue;

          const unwrapped = unwrap(decl.init);
          if (
            isMemberExpression(unwrapped) ||
            unwrapped.type === 'ChainExpression' ||
            unwrapped.type === 'TSNonNullExpression'
          ) {
            insertionLine = nodeEnd + 1;
          }
        }
      }
    }

    // Case 2: this.foo = obj.prop;
    if (isExpressionStatement(node)) {
      const expr = (node as { expression: AcornNode }).expression;
      if (
        isAssignmentExpression(expr) &&
        (expr as { operator: string }).operator === '='
      ) {
        if (node.start === undefined || node.end === undefined) return;

        const nodeStart = document.positionAt(node.start).line;
        const nodeEnd = document.positionAt(node.end).line;
        if (selectionLine < nodeStart || selectionLine > nodeEnd) return;

        const left = (expr as { left: AcornNode }).left;

        if (isMemberExpression(left)) {
          // Get the text representation of the left side
          const leftText = getNodeText(code, left);
          if (leftText === variableName) {
            insertionLine = nodeEnd + 1;
          }
        }
      }
    }
  });

  return insertionLine;
}

function unwrap(expr: AcornNode): AcornNode {
  let current = expr;
  const visited = new Set<AcornNode>();
  let depth = 0;
  const MAX_DEPTH = 1000;

  while (
    isTSAsExpression(current) ||
    isParenthesizedExpression(current) ||
    current.type === 'TSNonNullExpression'
  ) {
    // Safeguards against infinite loops
    if (depth >= MAX_DEPTH) {
      console.warn(
        `unwrap: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
      );
      return current;
    }
    if (visited.has(current)) {
      return current;
    }
    visited.add(current);
    depth++;

    current = (current as unknown as { expression: AcornNode }).expression;
  }
  return current;
}

function getNodeText(code: string, node: AcornNode): string {
  if (node.start !== undefined && node.end !== undefined) {
    return code.substring(node.start, node.end);
  }
  return '';
}
