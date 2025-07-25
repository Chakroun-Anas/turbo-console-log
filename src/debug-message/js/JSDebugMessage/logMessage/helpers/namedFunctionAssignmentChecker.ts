import { LogMessage } from '@/entities';
import ts from 'typescript';
import { TextDocument } from 'vscode';

export function namedFunctionAssignmentChecker(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node): void {
    if (isChecked) return;

    // Handle: const myFn = function() {} or const myFn = () => {}
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.name.text === variableName &&
          decl.initializer &&
          (ts.isFunctionExpression(decl.initializer) ||
            ts.isArrowFunction(decl.initializer))
        ) {
          const line = document.positionAt(decl.getStart()).line;
          if (line === selectionLine) {
            isChecked = true;
            return;
          }
        }
      }
    }

    // Handle: obj.myFn = function() {} or obj.myFn = () => {}
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      ts.isPropertyAccessExpression(node.expression.left) &&
      ts.isIdentifier(node.expression.left.name) &&
      node.expression.left.name.text === variableName &&
      (ts.isFunctionExpression(node.expression.right) ||
        ts.isArrowFunction(node.expression.right))
    ) {
      const line = document.positionAt(node.getStart()).line;
      if (line === selectionLine) {
        isChecked = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  return {
    isChecked,
    metadata: { line: selectionLine } as Pick<LogMessage, 'metadata'>,
  };
}
