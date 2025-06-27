import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function arrayAssignmentChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  if (document.lineCount === selectionLine + 1) {
    return {
      isChecked: lineCodeProcessing.isArrayAssignedToVariable(
        `${currentLineText}}`,
      ),
    };
  }
  const nextLineText = document
    .lineAt(selectionLine + 1)
    .text.replace(/\s/g, '');
  return {
    isChecked: lineCodeProcessing.isArrayAssignedToVariable(
      `${currentLineText}\n${nextLineText}`,
    ),
  };
}
