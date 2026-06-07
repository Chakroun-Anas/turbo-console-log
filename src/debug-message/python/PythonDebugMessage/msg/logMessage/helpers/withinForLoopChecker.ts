/**
 * Checks whether the selected variable appears in a for-loop header
 * on the selection line (either loop variable or iterable).
 * Example: for item in collection:  →  select "item" or "collection"
 * Example: for i, val in enumerate(data):  →  select "val"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { findStatementAtLine } from '../../python-parser-utils/walk';
import { isForStatement } from '../../python-parser-utils/guards';
import { varAppearsInText } from './utils';

export function withinForLoopChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isForStatement(stmt)) return { isChecked: false };

  const lineText = document.lineAt(selectionLine).text;
  return { isChecked: varAppearsInText(lineText, selectedVar) };
}
