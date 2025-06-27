import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function functionCallAssignmentChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  if (document.lineCount === selectionLine + 1) {
    return {
      isChecked: false,
    };
  }
  return {
    isChecked:
      lineCodeProcessing.isFunctionCall(currentLineText) &&
      lineCodeProcessing.isAssignedToVariable(currentLineText),
  };
}
