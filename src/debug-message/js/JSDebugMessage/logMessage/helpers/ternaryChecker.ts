import * as ts from 'typescript';
import { TextDocument } from 'vscode';

export function ternaryChecker(
  document: TextDocument,
  _lineCodeProcessing: unknown,
  selectionLine: number,
): { isChecked: boolean } {
  const sourceText = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
  );

  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node: ts.Node): void {
    if (isChecked) return;

    const startLine = document.positionAt(node.getStart()).line;
    const endLine = document.positionAt(node.getEnd()).line;
    if (selectionLine < startLine || selectionLine > endLine) return;

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (decl.initializer && containsTernary(decl.initializer)) {
          isChecked = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}

function containsTernary(node: ts.Node): boolean {
  if (ts.isConditionalExpression(node)) return true;
  return ts.forEachChild(node, containsTernary) ?? false;
}
