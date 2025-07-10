import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function objectLiteralChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  let lineIdx = selectionLine;
  let combined = '';

  while (lineIdx < document.lineCount) {
    const txt = document.lineAt(lineIdx).text;

    // skip full-line comments
    const stripped = txt.trim();
    if (stripped.startsWith('//') || stripped.startsWith('/*')) {
      lineIdx++;
      continue;
    }

    combined += txt.replace(/\s+/g, ' ');
    // once we reach “= {” (with only spaces between) we have enough
    if (/=\s*\{/.test(combined)) break;

    lineIdx++;
  }

  return {
    isChecked: lineCodeProcessing.isObjectLiteralAssignedToVariable(combined),
  };
}
