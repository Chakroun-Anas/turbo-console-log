import type { TextDocument } from 'vscode';
import type { SyntaxNode } from '@lezer/common';
import type { PythonProgram } from '../../python-parser-utils/types';
import {
  findStatementAtLine,
  findChild,
  offsetToLine,
} from '../../python-parser-utils/walk';
import { isAssignStatement } from '../../python-parser-utils/guards';

/**
 * Test whether `varName` appears as a standalone identifier (word-boundary
 * match) inside `text`. Prevents "x" from matching "x_total".
 */
export function varAppearsInText(text: string, varName: string): boolean {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-zA-Z0-9_])${escaped}(?![a-zA-Z0-9_])`).test(text);
}

/**
 * Shared guard for all simple-assignment checkers.
 * Returns the RHS node when the statement at `selectionLine` is:
 *   `selectedVar = <expr>`
 * Returns null if any guard fails.
 */
export function getSimpleAssignRhs(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): SyntaxNode | null {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isAssignStatement(stmt)) return null;

  const lhs = stmt.firstChild;
  if (!lhs || lhs.type.name !== 'VariableName') return null;

  if (document.getText().slice(lhs.from, lhs.to) !== selectedVar) return null;

  const assignOp = findChild(stmt, 'AssignOp');
  if (!assignOp) return null;

  const rhs = assignOp.nextSibling;
  if (!rhs) return null;

  if (offsetToLine(program, stmt.from) !== selectionLine) return null;

  return rhs;
}
