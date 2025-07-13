import ts from 'typescript';
import { TextDocument } from 'vscode';

export function objectFunctionCallAssignmentChecker(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  const sourceFile = ts.createSourceFile(
    'file.ts',
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node) {
    if (isChecked) return;

    if (ts.isVariableDeclaration(node)) {
      const { name, initializer } = node;
      const { line } = document.positionAt(node.getStart());

      if (line !== selectionLine || !initializer) return;

      const isTargetVar = (n: ts.BindingName) =>
        ts.isIdentifier(n) && n.text === variableName;

      // Case: const result = obj.method() or exec(...)
      if (isTargetVar(name) && ts.isCallExpression(initializer)) {
        isChecked = true;
        return;
      }

      // Case: const { data } = obj.method()
      if (
        ts.isObjectBindingPattern(name) &&
        name.elements.some(
          (el) =>
            ts.isBindingElement(el) &&
            ts.isIdentifier(el.name) &&
            el.name.text === variableName,
        ) &&
        ts.isCallExpression(initializer)
      ) {
        isChecked = true;
        return;
      }

      // Case: const result = wrapperFn({ queryFn: () => obj.method() })
      if (isTargetVar(name) && ts.isCallExpression(initializer)) {
        for (const arg of initializer.arguments) {
          if (
            ts.isObjectLiteralExpression(arg) &&
            arg.properties.some((prop) => {
              if (
                ts.isPropertyAssignment(prop) &&
                (ts.isFunctionExpression(prop.initializer) ||
                  ts.isArrowFunction(prop.initializer))
              ) {
                return ts.forEachChild(
                  prop.initializer,
                  function searchNestedCall(n): boolean {
                    if (
                      ts.isCallExpression(n) &&
                      ts.isPropertyAccessExpression(n.expression)
                    ) {
                      return true;
                    }
                    return ts.forEachChild(n, searchNestedCall) || false;
                  },
                );
              }
              return false;
            })
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
