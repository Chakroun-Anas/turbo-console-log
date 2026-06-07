/**
 * Checks whether the selection is an augmented assignment (+=, -=, *=, etc.)
 * Example: count += 1  →  select "count"
 * Example: total -= discount  →  select "total"
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import {
  findStatementAtLine,
  offsetToLine,
} from '../../python-parser-utils/walk';
import { isAugmentedAssignStatement } from '../../python-parser-utils/guards';

export function augmentedAssignmentChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isAugmentedAssignStatement(stmt)) return { isChecked: false };

  const lhs = stmt.firstChild;
  if (!lhs || lhs.type.name !== 'VariableName') return { isChecked: false };

  if (document.getText().slice(lhs.from, lhs.to) !== selectedVar) {
    return { isChecked: false };
  }

  return { isChecked: offsetToLine(program, stmt.from) === selectionLine };
}
