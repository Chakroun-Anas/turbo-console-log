import { TextDocument, Position } from 'vscode';
import {
  isProperty,
  isVariableDeclaration,
  walk,
  type AcornNode,
  type VariableDeclaration,
} from '../../acorn-utils';

export function rawPropertyAccessLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(variableName);
  if (charIndex === -1) return selectionLine + 1;

  const offsetStart = document.offsetAt(new Position(selectionLine, charIndex));
  const offsetEnd = offsetStart + variableName.length;

  let foundProperty: AcornNode | undefined;

  // First, find the Property node at the selection
  walk(ast, (node: AcornNode): boolean | void => {
    if (
      node.start <= offsetStart &&
      node.end >= offsetEnd &&
      isProperty(node) &&
      !foundProperty
    ) {
      foundProperty = node;
      return true; // Stop early once found
    }
  });

  if (!foundProperty) {
    return selectionLine + 1;
  }

  // Now find the VariableDeclaration that contains this property
  let containingVarDecl: VariableDeclaration | undefined;
  const propertyStart = foundProperty.start;
  const propertyEnd = foundProperty.end;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isVariableDeclaration(node)) {
      const varDecl = node as VariableDeclaration;
      // Check if the property is within this variable declaration's range
      if (varDecl.start <= propertyStart && varDecl.end >= propertyEnd) {
        containingVarDecl = varDecl;
        return true; // Stop early
      }
    }
  });

  if (containingVarDecl) {
    const endPos = document.positionAt(containingVarDecl.end);
    return endPos.line + 1;
  }

  return selectionLine + 1;
}
