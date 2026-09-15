import { TextDocument } from 'vscode';
import { type AcornNode, findBindingDeclaration } from '../../acorn-utils';

export function primitiveAssignmentLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // After the whole declaration statement: acorn drops the parentheses around
  // a JSX initializer, and a declarator list continues past the first init.
  const declaration = findBindingDeclaration(ast, selectionLine, variableName);
  if (!declaration) return selectionLine + 1;

  return document.positionAt(declaration.end).line + 1;
}
