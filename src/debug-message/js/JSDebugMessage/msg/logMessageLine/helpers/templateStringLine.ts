import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  isVariableDeclaration,
  isIdentifier,
  isTemplateLiteral,
  isTaggedTemplateExpression,
  walk,
} from '../../acorn-utils';

export function templateStringLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Default insertion: one line below selection
  let insertionLine = selectionLine + 1;

  // Walk the AST looking for our variable's declaration
  walk(ast, (node: AcornNode): boolean | void => {
    if (isVariableDeclaration(node)) {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        if (
          isIdentifier(decl.id) &&
          (decl.id as { name: string }).name === variableName &&
          decl.init &&
          (isTemplateLiteral(decl.init) ||
            isTaggedTemplateExpression(decl.init))
        ) {
          // We found "const foo = `<template>`" for our foo
          // For tagged templates, we want the quasi (template) part
          const templateNode = isTaggedTemplateExpression(decl.init)
            ? (decl.init as { quasi: AcornNode }).quasi
            : decl.init;

          const endPos = document.positionAt(templateNode.end);
          insertionLine = endPos.line + 1;
          return true; // Stop early
        }
      }
    }
  });

  return insertionLine;
}
