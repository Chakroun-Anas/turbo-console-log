/**
 * Returns the line of the return statement, so the log is inserted
 * BEFORE the return — letting the developer see the value before it's returned.
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import {
  findStatementAtLine,
  offsetToLine,
} from '../../python-parser-utils/walk';
import { isReturnStatement } from '../../python-parser-utils/guards';

export function withinReturnStatementLine(
  program: PythonProgram,
  _document: TextDocument,
  selectionLine: number,
): number {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isReturnStatement(stmt)) return selectionLine + 1;
  return offsetToLine(program, stmt.from);
}
