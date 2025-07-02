import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function objectFunctionCallAssignmentChecker(
  document: TextDocument,
  selectionLine: number,
  fullRhs: string,
  lineCodeProcessing: LineCodeProcessing,
) {
  const currentLineText = document.lineAt(selectionLine).text;
  return {
    isChecked:
      lineCodeProcessing.isObjectFunctionCall(fullRhs) &&
      lineCodeProcessing.isAssignedToVariable(currentLineText),
  };
}
