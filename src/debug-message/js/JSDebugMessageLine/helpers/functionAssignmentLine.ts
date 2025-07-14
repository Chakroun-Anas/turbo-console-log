import ts from 'typescript';
import { TextDocument } from 'vscode';

export function functionAssignmentLine(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  const text = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
  );

  let insertionLine = selectionLine + 1;

  ts.forEachChild(sourceFile, function visit(node) {
    // Case ①: const fn = (...) => {...} or function (...) {...}
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === selectedVar &&
      node.initializer
    ) {
      const unwrapped = unwrap(node.initializer);
      if (ts.isFunctionExpression(unwrapped) || ts.isArrowFunction(unwrapped)) {
        insertionLine = getFunctionBodyEndLine(unwrapped, document) + 1;
        return;
      }
    }

    // Case ②: obj.fn = (...) => {...}
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.expression.left) &&
      node.expression.left.name.text === selectedVar
    ) {
      const rhs = unwrap(node.expression.right);
      if (ts.isFunctionExpression(rhs) || ts.isArrowFunction(rhs)) {
        insertionLine = getFunctionBodyEndLine(rhs, document) + 1;
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  return insertionLine;
}

function unwrap(expr: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(expr) ||
    ts.isAsExpression(expr) ||
    ts.isTypeAssertionExpression(expr)
  ) {
    expr = expr.expression;
  }
  return expr;
}

function getFunctionBodyEndLine(
  node: ts.FunctionExpression | ts.ArrowFunction,
  document: TextDocument,
): number {
  if (!node.body) return 0;
  const endPos = ts.isBlock(node.body) ? node.body.end : node.body.getEnd();
  return document.positionAt(endPos).line;
}
