/**
 * Checks whether the selection is an assignment from a ternary
 * (conditional) expression.
 * Example: label = "yes" if flag else "no"  →  select "label"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import { isConditionalExpression } from '../../python-parser-utils/guards';

export function ternaryChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isConditionalExpression(rhs) };
}
