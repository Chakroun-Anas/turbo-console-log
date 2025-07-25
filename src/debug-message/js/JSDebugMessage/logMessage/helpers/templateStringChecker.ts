import ts from 'typescript';
import { TextDocument } from 'vscode';

export function templateStringChecker(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer &&
      (ts.isTemplateExpression(node.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(node.initializer) ||
        ts.isTaggedTemplateExpression(node.initializer))
    ) {
      // Find the line where this declaration actually starts
      const declLine = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile),
      ).line;

      if (declLine === selectionLine) {
        isChecked = true;
        return; // we found our match, can bail out early
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { isChecked };
}
