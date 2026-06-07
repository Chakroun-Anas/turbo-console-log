/**
 * Checks whether the selection is an assignment from a method call.
 * The RHS must be a CallExpression whose callee is a dot-access MemberExpression.
 * Example: result = obj.process()  →  select "result"
 * Example: data = self.fetch(url)  →  select "data"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import {
  isCallExpression,
  isDotAccessMemberExpression,
} from '../../python-parser-utils/guards';

export function methodCallAssignmentChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs || !isCallExpression(rhs)) return { isChecked: false };

  const callee = rhs.firstChild;
  return { isChecked: callee ? isDotAccessMemberExpression(callee) : false };
}
