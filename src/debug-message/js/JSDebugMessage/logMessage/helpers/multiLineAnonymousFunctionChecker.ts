import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function multiLineAnonymousFunctionChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  return {
    isChecked:
      lineCodeProcessing.isFunctionAssignedToVariable(`${currentLineText}`) &&
      lineCodeProcessing.isAnonymousFunction(currentLineText) &&
      lineCodeProcessing.shouldTransformAnonymousFunction(currentLineText),
  };
}
