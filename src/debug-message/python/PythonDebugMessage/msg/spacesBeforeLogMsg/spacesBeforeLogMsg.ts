import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../python-parser-utils/types';
import {
  findStatementAtLine,
  offsetToLine,
} from '../python-parser-utils/walk';

function firstNonWhitespaceIndex(text: string): number {
  const match = text.match(/\S/);
  return match ? (match.index ?? text.length) : text.length;
}

function leadingWhitespace(text: string): string {
  return text.slice(0, firstNonWhitespaceIndex(text));
}

export function spacesBeforeLogMsg(
  program: PythonProgram,
  document: TextDocument,
  selectedVarLine: number,
  logMsgLine: number,
): string {
  // Reference indentation comes from the *first line of the statement* that
  // contains the selection — not the raw selection line. When a variable is
  // selected on a continuation line of a multi-line statement (e.g. inside a
  // parenthesized `return ( ... )` or a multi-line call), that continuation is
  // indented deeper than the statement itself; using it would over-indent the
  // inserted log. Falling back to the selection line keeps single-line behavior.
  const stmt = findStatementAtLine(program, selectedVarLine);
  const refLine = stmt ? offsetToLine(program, stmt.from) : selectedVarLine;
  const refIndent = leadingWhitespace(document.lineAt(refLine).text);

  if (logMsgLine < document.lineCount) {
    const logLineText = document.lineAt(logMsgLine).text;
    if (logLineText.trim().length > 0) {
      const logIndent = leadingWhitespace(logLineText);
      return logIndent.length >= refIndent.length ? logIndent : refIndent;
    }
  }

  return refIndent;
}
