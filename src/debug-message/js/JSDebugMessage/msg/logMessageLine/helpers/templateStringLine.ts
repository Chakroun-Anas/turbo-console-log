import { TextDocument } from 'vscode';
import { type AcornNode, findBindingDeclaration } from '../../acorn-utils';

export function templateStringLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const declaration = findBindingDeclaration(ast, selectionLine, variableName);
  if (!declaration) return selectionLine + 1;

  return document.positionAt(declaration.end).line + 1;
}
