import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type FunctionExpression,
  type ArrowFunctionExpression,
  type VariableDeclaration,
  isIdentifier,
  isFunctionExpression,
  isArrowFunctionExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isMemberExpression,
  isParenthesizedExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  isBlockStatement,
  walk,
} from '../../acorn-utils';

export function functionAssignmentLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let insertionLine = selectionLine + 1;

  walk(ast, (node: AcornNode): boolean | void => {
    // Case ①: const fn = (...) => {...} or function (...) {...}
    if (node.type === 'VariableDeclaration') {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        if (
          isIdentifier(decl.id) &&
          decl.id.name === selectedVar &&
          decl.init
        ) {
          const unwrapped = unwrap(decl.init);
          if (
            isFunctionExpression(unwrapped) ||
            isArrowFunctionExpression(unwrapped)
          ) {
            insertionLine = getFunctionBodyEndLine(unwrapped, document) + 1;
            return true;
          }
        }
      }
    }

    // Case ②: obj.fn = (...) => {...}
    if (isExpressionStatement(node)) {
      const expr = (node as { expression?: AcornNode }).expression;
      if (expr && isAssignmentExpression(expr)) {
        const assignment = expr as {
          operator: string;
          left?: AcornNode;
          right?: AcornNode;
        };

        if (
          assignment.operator === '=' &&
          assignment.left &&
          isMemberExpression(assignment.left)
        ) {
          const member = assignment.left as {
            property?: AcornNode;
          };

          if (
            member.property &&
            isIdentifier(member.property) &&
            member.property.name === selectedVar &&
            assignment.right
          ) {
            const rhs = unwrap(assignment.right);
            if (isFunctionExpression(rhs) || isArrowFunctionExpression(rhs)) {
              insertionLine = getFunctionBodyEndLine(rhs, document) + 1;
              return true;
            }
          }
        }
      }
    }
  });

  return insertionLine;
}

function unwrap(expr: AcornNode): AcornNode {
  const visited = new Set<AcornNode>();
  let depth = 0;
  const MAX_DEPTH = 1000;

  while (
    isParenthesizedExpression(expr) ||
    isTSAsExpression(expr) ||
    isTSTypeAssertion(expr)
  ) {
    // Safeguards against infinite loops
    if (depth >= MAX_DEPTH) {
      console.warn(
        `unwrap: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
      );
      return expr;
    }
    if (visited.has(expr)) {
      return expr;
    }
    visited.add(expr);
    depth++;

    expr = (expr as { expression: AcornNode }).expression;
  }
  return expr;
}

function getFunctionBodyEndLine(
  node: FunctionExpression | ArrowFunctionExpression,
  document: TextDocument,
): number {
  if (!node.body) return 0;

  const body = node.body as AcornNode;
  const endPos = isBlockStatement(body) ? body.end : body.end;

  if (endPos === undefined) return 0;

  return document.positionAt(endPos).line;
}
