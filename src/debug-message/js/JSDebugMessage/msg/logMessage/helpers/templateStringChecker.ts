import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclarator,
  isIdentifier,
  isTemplateLiteral,
  isTaggedTemplateExpression,
  walk,
} from '../../acorn-utils';

export function templateStringChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  if (!ast) {
    return { isChecked: false };
  }

  let isChecked = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true; // early exit

    // Check for variable declarations with template literal initializers
    if (node.type === 'VariableDeclarator') {
      const declarator = node as VariableDeclarator;
      const id = declarator.id;
      const init = declarator.init;

      // Check if it's the variable we're looking for
      if (
        id &&
        isIdentifier(id) &&
        id.name === variableName &&
        init &&
        (isTemplateLiteral(init) || isTaggedTemplateExpression(init))
      ) {
        // Check if the node is on the selection line
        if (node.start !== undefined) {
          const position = document.positionAt(node.start);
          if (position.line === selectionLine) {
            isChecked = true;
            return true; // early exit
          }
        }
      }
    }
  });

  return { isChecked };
}
