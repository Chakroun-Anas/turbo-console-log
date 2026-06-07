/**
 * Checks whether the selected variable is a parameter of the function
 * defined on the selection line.
 * Example: def process(data, timeout=30):  →  select "data" or "timeout"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import {
  findStatementAtLine,
  findChild,
  findChildren,
} from '../../python-parser-utils/walk';
import { isFunctionDefinition } from '../../python-parser-utils/guards';

export function functionParameterChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isFunctionDefinition(stmt)) return { isChecked: false };

  const paramList = findChild(stmt, 'ParamList');
  if (!paramList) return { isChecked: false };

  const text = document.getText();
  const params = findChildren(paramList, 'VariableName');
  return {
    isChecked: params.some((p) => text.slice(p.from, p.to) === selectedVar),
  };
}
