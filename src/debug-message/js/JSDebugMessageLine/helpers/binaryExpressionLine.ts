import ts from 'typescript';
import { TextDocument } from 'vscode';

export function binaryExpressionLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
  );

  // Try to locate the VariableDeclaration first
  const decl = findVariableDeclaration(sourceFile, variableName);
  if (!decl || !decl.initializer) {
    return selectionLine + 1;
  }

  const root = unwrap(decl.initializer);

  if (!ts.isBinaryExpression(root)) {
    return selectionLine + 1;
  }

  // Crawl the full expression tree to get the last line
  let maxEndLine = 0;

  (function crawl(n: ts.Node) {
    const line = document.positionAt(n.getEnd()).line;
    if (line > maxEndLine) maxEndLine = line;
    ts.forEachChild(n, crawl);
  })(root);

  return maxEndLine + 1;
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
