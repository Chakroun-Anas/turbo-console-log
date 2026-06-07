/**
 * Checks whether the selection is an assignment from a subscript (index/key)
 * expression.
 * Example: item = arr[0]          →  select "item"
 * Example: value = data['key']    →  select "value"
 * Example: cell = matrix[row][col]→  select "cell"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import { isSubscriptExpression } from '../../python-parser-utils/guards';

export function arrayElementAssignmentChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isSubscriptExpression(rhs) };
}
