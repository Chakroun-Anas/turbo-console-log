import ts from 'typescript';
import { TextDocument } from 'vscode';

export function binaryExpressionLine(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Try to locate the VariableDeclaration first
  const decl = findVariableDeclaration(sourceFile, variableName);
  if (decl && decl.initializer) {
    const root = unwrap(decl.initializer);
    if (ts.isBinaryExpression(root)) {
      return calculateMaxEndLine(document, root);
    }
  }

  // Try to locate assignment expression if no variable declaration found
  const assignment = findAssignmentExpression(
    sourceFile,
    variableName,
    selectionLine,
    document,
  );
  if (assignment) {
    return calculateMaxEndLine(document, assignment);
  }

  return selectionLine + 1;
}

function unwrap(node: ts.Expression): ts.Expression {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return unwrap(node.expression);
  }
  return node;
}

function findVariableDeclaration(
  root: ts.Node,
  name: string,
): ts.VariableDeclaration | undefined {
  let found: ts.VariableDeclaration | undefined;
  ts.forEachChild(root, function walk(n) {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.name.text === name
    ) {
      found = n;
      return;
    }
    ts.forEachChild(n, walk);
  });
  return found;
}

function findAssignmentExpression(
  root: ts.Node,
  variableName: string,
  selectionLine: number,
  document: TextDocument,
): ts.BinaryExpression | undefined {
  let found: ts.BinaryExpression | undefined;

  ts.forEachChild(root, function walk(node) {
    if (found) return;

    if (ts.isExpressionStatement(node)) {
      const start = document.positionAt(node.getStart()).line;
      const end = document.positionAt(node.getEnd()).line;
      if (selectionLine < start || selectionLine > end) return;

      const expr = node.expression;
      if (
        ts.isBinaryExpression(expr) &&
        expr.operatorToken.kind === ts.SyntaxKind.EqualsToken
      ) {
        if (ts.isIdentifier(expr.left) && expr.left.text === variableName) {
          if (containsBinary(expr.right)) {
            found = expr.right as ts.BinaryExpression;
            return;
          }
        }
      }
    }

    ts.forEachChild(node, walk);
  });

  return found;
}

function calculateMaxEndLine(
  document: TextDocument,
  root: ts.Expression,
): number {
  let maxEndLine = 0;

  (function crawl(n: ts.Node) {
    const line = document.positionAt(n.getEnd()).line;
    if (line > maxEndLine) maxEndLine = line;
    ts.forEachChild(n, crawl);
  })(root);

  return maxEndLine + 1;
}

function containsBinary(node: ts.Node): boolean {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return containsBinary(node.expression);
  }

  if (ts.isBinaryExpression(node)) return true;

  return ts.forEachChild(node, containsBinary) ?? false;
}
