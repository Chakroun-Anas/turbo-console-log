import { TextDocument } from 'vscode';
import {
  type AcornNode,
  findSelectionReturnStatement,
} from '../../acorn-utils';

/**
 * AST-based checker to determine if a variable is within a return statement context
 * @param document - The VS Code text document
 * @param selectionLine - The line where the variable is selected
 * @param variableName - The name of the selected variable
 * @returns Object indicating if the check passed
 */
export function withinReturnStatementChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const returnStatement = findSelectionReturnStatement(
    ast,
    document,
    selectionLine,
    variableName,
  );
  return { isChecked: returnStatement !== undefined };
}
