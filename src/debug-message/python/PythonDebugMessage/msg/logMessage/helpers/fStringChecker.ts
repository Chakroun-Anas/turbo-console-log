/**
 * Checks whether the selection is an assignment from an f-string.
 * Example: msg = f"Hello {name}, you have {count} items"  →  select "msg"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import { isFormatString } from '../../python-parser-utils/guards';

export function fStringChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isFormatString(rhs) };
}
