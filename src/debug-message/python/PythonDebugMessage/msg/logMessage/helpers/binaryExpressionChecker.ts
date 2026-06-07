/**
 * Checks whether the selection is an assignment from a binary expression.
 * Example: total = price * qty     →  select "total"
 * Example: msg = greeting + name  →  select "msg"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import { isBinaryExpression } from '../../python-parser-utils/guards';

export function binaryExpressionChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isBinaryExpression(rhs) };
}
