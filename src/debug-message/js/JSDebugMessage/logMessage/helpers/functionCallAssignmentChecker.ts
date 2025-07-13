import ts from 'typescript';
import { TextDocument } from 'vscode';

export function functionCallAssignmentChecker(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  const sourceFile = ts.createSourceFile(
    'file.ts',
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
  );

  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node) {
    if (!ts.isVariableStatement(node)) return;

    for (const decl of node.declarationList.declarations) {
      const { name, initializer } = decl;
      const declLine = document.positionAt(decl.getStart()).line;
      if (declLine !== selectionLine || !initializer) continue;

      // Case: const result = doSomething();
      if (ts.isIdentifier(name) && name.text === variableName) {
        const core = unwrapExpression(initializer);
        if (
          ts.isCallExpression(core) ||
          (ts.isAwaitExpression(initializer) &&
            ts.isCallExpression(unwrapExpression(initializer.expression)))
        ) {
          isChecked = true;
          return;
        }
      }

      // Case: const obj = { result: doSomething() }
      if (ts.isIdentifier(name) && ts.isObjectLiteralExpression(initializer)) {
        for (const prop of initializer.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === variableName &&
            ts.isCallExpression(unwrapExpression(prop.initializer))
          ) {
            isChecked = true;
            return;
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}

function unwrapExpression(expr: ts.Expression): ts.Expression {
  while (ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
    expr = expr.expression;
  }
  return expr;
}
