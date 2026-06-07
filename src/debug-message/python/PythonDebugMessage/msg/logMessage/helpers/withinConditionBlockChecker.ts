/**
 * Checks whether the selected variable appears in an if/elif/while condition
 * on the selection line.
 * Example: if is_active and user:  →  select "is_active" or "user"
 * Example: while retries < limit:  →  select "retries"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { findStatementAtLine } from '../../python-parser-utils/walk';
import { isIfStatement, isWhileStatement } from '../../python-parser-utils/guards';
import { varAppearsInText } from './utils';

export function withinConditionBlockChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || (!isIfStatement(stmt) && !isWhileStatement(stmt))) {
    return { isChecked: false };
  }

  const lineText = document.lineAt(selectionLine).text;
  return { isChecked: varAppearsInText(lineText, selectedVar) };
}
