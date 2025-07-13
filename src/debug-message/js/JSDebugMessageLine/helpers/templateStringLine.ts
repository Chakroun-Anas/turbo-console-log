import ts from 'typescript';
import { TextDocument } from 'vscode';

export function templateStringLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const sourceText = document.getText();
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TS,
  );

  // Default insertion: one line below selection
  let insertionLine = selectionLine + 1;

  // Walk the AST looking for our variable’s declaration
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
      // We found “const foo = `<template>`” for our foo
      const endPos = node.initializer.getEnd();
      const { line: endLine } =
        sourceFile.getLineAndCharacterOfPosition(endPos);
      insertionLine = endLine + 1;
      return; // done
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return insertionLine;
}
