/**
 * Returns the first line of the loop body, so the log is inserted as the first
 * statement INSIDE the loop. The loop variable does not exist before the loop
 * (logging it above the `for` would raise NameError), and logging inside the
 * body lets the developer see the value on every iteration.
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import {
  findStatementAtLine,
  firstBodyStatementLine,
} from '../../python-parser-utils/walk';
import { isForStatement } from '../../python-parser-utils/guards';

export function withinForLoopLine(
  program: PythonProgram,
  _document: TextDocument,
  selectionLine: number,
): number {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isForStatement(stmt)) return selectionLine + 1;
  return firstBodyStatementLine(program, stmt);
}
