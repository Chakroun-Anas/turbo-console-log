import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function typedFunctionCallAssignmentChecker(
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
      lineCodeProcessing.isTypedFunctionCallAssignment(currentLineText) &&
      lineCodeProcessing.isAssignedToVariable(currentLineText),
  };
}
