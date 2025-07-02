import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function objectLiteralChecker(
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

  let nextLineIndex = selectionLine + 1;
  let nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');

  // Skip comment-only lines
  while (
    nextLineText.trim().startsWith('//') ||
    nextLineText.trim().startsWith('/*')
  ) {
    if (nextLineText.trim().startsWith('/*')) {
      // Skip lines until the end of the multi-line comment
      while (!nextLineText.trim().endsWith('*/')) {
        nextLineIndex++;
        if (nextLineIndex >= document.lineCount) {
          return {
            isChecked: false,
          };
        }
        nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');
      }
      nextLineIndex++;
    } else {
      nextLineIndex++;
    }

    if (nextLineIndex >= document.lineCount) {
      return {
        isChecked: false,
      };
    }
    nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');
  }

  const combinedText = `${currentLineText}${nextLineText}`;
  return {
    isChecked:
      lineCodeProcessing.isObjectLiteralAssignedToVariable(combinedText),
  };
}
