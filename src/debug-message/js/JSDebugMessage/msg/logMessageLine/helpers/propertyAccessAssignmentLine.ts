import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  isIdentifier,
  isMemberExpression,
  unwrapTransparent,
  findAssignmentStatement,
  walk,
} from '../../acorn-utils';

export function propertyAccessAssignmentLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let insertionLine: number | undefined;

  walk(ast, (node: AcornNode): void => {
    // Case 1: const foo = obj.prop;
    if (node.type === 'VariableDeclaration') {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        if (
          isIdentifier(decl.id) &&
          (decl.id as { name: string }).name === variableName &&
          decl.init
        ) {
          if (node.start === undefined || node.end === undefined) continue;

          const nodeStart = document.positionAt(node.start).line;
          const nodeEnd = document.positionAt(node.end).line;
          if (selectionLine < nodeStart || selectionLine > nodeEnd) continue;

          const unwrapped = unwrapTransparent(decl.init);
          if (
            isMemberExpression(unwrapped) ||
            unwrapped.type === 'ChainExpression'
          ) {
            insertionLine = nodeEnd + 1;
          }
        }
      }
    }
  });

  if (insertionLine !== undefined) return insertionLine;

  // Case 2: reassignments (this.foo = obj.prop; state = {…}; x ??= new X(…)):
  // after the whole statement, so the log prints the assigned value.
  const assignment = findAssignmentStatement(
    ast,
    document.getText(),
    selectionLine,
    variableName,
  );
  if (assignment) {
    return document.positionAt(assignment.end).line + 1;
  }

  return selectionLine + 1;
}
