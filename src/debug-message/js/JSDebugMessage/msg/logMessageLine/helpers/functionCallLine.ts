import { TextDocument } from 'vscode';
import {
  type AcornNode,
  findAssignmentStatement,
  findBindingDeclaration,
} from '../../acorn-utils';

export function functionCallLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Declarations: after the whole statement of the declaration that binds the
  // name (covers multi-declarator lists and inner declarations in callbacks).
  const declaration = findBindingDeclaration(ast, selectionLine, variableName);
  if (declaration) {
    return document.positionAt(declaration.end).line + 1;
  }

  // Reassignments (`data = await load(…)`, `client ||= createClient(…)`):
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
