/**
 * Checks whether the selected variable appears inside a return statement
 * on the selection line.
 * Example: return result + offset  →  select "result"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { findStatementAtLine } from '../../python-parser-utils/walk';
import { isReturnStatement } from '../../python-parser-utils/guards';
import { varAppearsInText } from './utils';

export function withinReturnStatementChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isReturnStatement(stmt)) return { isChecked: false };

  const returnText = document.getText().slice(stmt.from, stmt.to);
  return { isChecked: varAppearsInText(returnText, selectedVar) };
}
