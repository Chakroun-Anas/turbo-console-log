/**
 * Checks whether the selection is an assignment from a comprehension expression
 * (list, set, dict, or generator).
 * Example: evens = [x for x in nums if x % 2 == 0]  →  select "evens"
 * Example: squares = {n: n**2 for n in range(10)}   →  select "squares"
 * Example: gen = (x for x in items)                 →  select "gen"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import { isComprehensionExpression } from '../../python-parser-utils/guards';

export function listComprehensionChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isComprehensionExpression(rhs) };
}
