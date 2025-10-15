import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  isIdentifier,
  isObjectExpression,
  walk,
} from '../../acorn-utils';

export function objectLiteralLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let insertionLine = selectionLine + 1;
  let found = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (found) return true; // Stop walking

    if (node.type === 'VariableDeclaration') {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        if (
          isIdentifier(decl.id) &&
          (decl.id as { name: string }).name === variableName &&
          decl.init &&
          isObjectExpression(decl.init)
        ) {
          // Check if decl has location info
          if (!decl.loc) continue;

          // Get the full declaration range (includes type annotation)
          const declStartLine = decl.loc.start.line - 1; // Acorn uses 1-based lines
          const declEndLine = decl.loc.end.line - 1;

          // Check if selection is anywhere within the declaration
          if (selectionLine >= declStartLine && selectionLine <= declEndLine) {
            if (decl.init.end === undefined) continue;

            const endLine = document.positionAt(decl.init.end).line;
            insertionLine = endLine + 1;
            found = true;
            return true; // Stop walking
          }
        }
      }
    }
  });

  return insertionLine;
}
