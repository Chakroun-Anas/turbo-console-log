import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../python-parser-utils/types';
import { afterStatementEndLine } from '../../python-parser-utils/walk';

export function functionCallAssignmentLine(
  program: PythonProgram,
  _document: TextDocument,
  selectionLine: number,
): number {
  return afterStatementEndLine(program, selectionLine);
}
