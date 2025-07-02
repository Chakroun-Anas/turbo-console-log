import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';
import { BracketType, LogMessage } from '../../../../../entities';
import { getMultiLineContextVariable } from '../../../../../utilities';

export function namedFunctionAssignmentChecker(
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
  return {
    isChecked:
      (lineCodeProcessing.isFunctionAssignedToVariable(`${currentLineText}`) ||
        lineCodeProcessing.isFunctionAssignedToObjectProperty(
          `${currentLineText}`,
        )) &&
      multilineParenthesisVariable === null,
    metadata: {
      line: selectionLine,
    } as Pick<LogMessage, 'metadata'>,
  };
}
