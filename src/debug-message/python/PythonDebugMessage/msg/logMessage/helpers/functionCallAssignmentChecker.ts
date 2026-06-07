/**
 * Checks whether the selection is an assignment from a standalone function call
 * (NOT a method call — those are handled by methodCallAssignmentChecker).
 * Example: data = load_config()  →  select "data"
 * Example: result = int(value)   →  select "result"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';
import {
  isCallExpression,
  isMemberExpression,
} from '../../python-parser-utils/guards';

export function functionCallAssignmentChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs || !isCallExpression(rhs)) return { isChecked: false };

  const callee = rhs.firstChild;
  if (!callee) return { isChecked: false };

  // Must NOT be a method call (MemberExpression callee)
  return { isChecked: !isMemberExpression(callee) };
}
