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

    // Handle variable declarations (existing logic)
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const { name, initializer } = decl;
        const startLine = document.positionAt(decl.getStart()).line;
        const endLine = document.positionAt(decl.getEnd()).line;

        if (
          selectionLine < startLine ||
          selectionLine > endLine ||
          !initializer
        )
          continue;

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

        // Case: const [githubSha] = process.argv.slice(2)
        if (
          ts.isArrayBindingPattern(name) &&
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
    }

    // New logic: handle assignment expressions (e.g., optionalDependencies[key] = optionalDependencies[key].replace(...))
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression)
    ) {
      const { left, right } = node.expression;
      const startLine = document.positionAt(node.getStart()).line;
      const endLine = document.positionAt(node.getEnd()).line;
      // Only check if selectionLine matches
      if (selectionLine < startLine || selectionLine > endLine) return;

      // Match left side: identifier or element access
      let leftText = '';
      if (ts.isIdentifier(left)) {
        leftText = left.text;
      } else if (ts.isElementAccessExpression(left)) {
        leftText = left.getText();
      }

      if (leftText === variableName && ts.isCallExpression(right)) {
        isChecked = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}
