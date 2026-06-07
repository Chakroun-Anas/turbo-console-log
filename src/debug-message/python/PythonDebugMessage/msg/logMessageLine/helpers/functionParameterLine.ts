/**
 * Returns the first line of the function body, so the log is inserted at
 * the very top of the function — right after the `def foo(...):` header.
 *
 * In Lezer, Body starts at the colon (`:`), so we skip that punctuation
 * token to find the first actual statement in the body.
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import {
  findStatementAtLine,
  firstBodyStatementLine,
} from '../../python-parser-utils/walk';
import { isFunctionDefinition } from '../../python-parser-utils/guards';

export function functionParameterLine(
  program: PythonProgram,
  _document: TextDocument,
  selectionLine: number,
): number {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt || !isFunctionDefinition(stmt)) return selectionLine + 1;
  return firstBodyStatementLine(program, stmt);
}
