/**
 * Returns the line of the if/while statement, so the log is inserted
 * BEFORE the condition — letting the developer see the value before evaluation.
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import {
  findStatementAtLine,
  offsetToLine,
  firstBodyStatementLine,
  conditionContainsWalrus,
} from '../../python-parser-utils/walk';
import {
  isIfStatement,
  isWhileStatement,
} from '../../python-parser-utils/guards';

export function withinConditionBlockLine(
  program: PythonProgram,
  _document: TextDocument,
  selectionLine: number,
): number {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || (!isIfStatement(stmt) && !isWhileStatement(stmt))) {
    return selectionLine + 1;
  }
  // A walrus (`:=`) in the condition binds a name during evaluation, like a loop
  // variable — logging it before the statement is a NameError. Insert into the
  // body so the value is captured where the name is actually in scope.
  if (conditionContainsWalrus(stmt)) {
    return firstBodyStatementLine(program, stmt);
  }
  return offsetToLine(program, stmt.from);
}
