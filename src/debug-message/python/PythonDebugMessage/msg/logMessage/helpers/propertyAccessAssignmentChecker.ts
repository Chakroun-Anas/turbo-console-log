/**
 * Checks whether the selection is an assignment from a property (dot) access.
 * Excludes subscript access like arr[0] — use arrayElementAssignmentChecker for those.
 * Example: name = user.full_name   →  select "name"
 * Example: cfg = self.config       →  select "cfg"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import { isDotAccessMemberExpression } from '../../python-parser-utils/guards';

export function propertyAccessAssignmentChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isDotAccessMemberExpression(rhs) };
}
