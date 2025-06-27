import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function ternaryChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  const MAX_TERNARY_LOOKAHEAD = 20;
  let concatenatedLines = currentLineText.trim(); // Start with the current line

  // Grab the next `MAX_TERNARY_LOOKAHEAD` lines and concatenate
  for (let i = 1; i < MAX_TERNARY_LOOKAHEAD; i++) {
    if (selectionLine + i < document.lineCount) {
      concatenatedLines += document.lineAt(selectionLine + i).text.trim();
    } else {
      break;
    }
  }
  return {
    isChecked:
      lineCodeProcessing.isTernaryExpressionAssignment(concatenatedLines),
  };
}
