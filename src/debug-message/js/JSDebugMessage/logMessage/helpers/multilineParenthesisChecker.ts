import { TextDocument } from 'vscode';
import { BracketType, LogMessage } from '../../../../../entities';
import { LineCodeProcessing } from '../../../../../line-code-processing';
import {
  closingContextLine,
  getMultiLineContextVariable,
} from '../../../../../utilities';

export function multilineParenthesisChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  const multilineParenthesisVariable = getMultiLineContextVariable(
    document,
    selectionLine,
    BracketType.PARENTHESIS,
    true,
  );
  const isChecked = multilineParenthesisVariable !== null;
  if (isChecked) {
    const isOpeningCurlyBraceContext = document
      .lineAt(multilineParenthesisVariable?.closingContextLine as number)
      .text.includes('{');
    if (
      lineCodeProcessing.isAssignedToVariable(currentLineText) &&
      isOpeningCurlyBraceContext
    ) {
      return {
        isChecked: true,
        metadata: {
          openingContextLine: selectionLine,
          closingContextLine: closingContextLine(
            document,
            multilineParenthesisVariable?.closingContextLine as number,
            BracketType.CURLY_BRACES,
          ),
        } as Pick<LogMessage, 'metadata'>,
      };
    }
    return {
      isChecked: true,
      metadata: {
        openingContextLine:
          multilineParenthesisVariable?.openingContextLine as number,
        closingContextLine:
          multilineParenthesisVariable?.closingContextLine as number,
      } as Pick<LogMessage, 'metadata'>,
    };
  }
  return {
    isChecked: false,
  };
}
