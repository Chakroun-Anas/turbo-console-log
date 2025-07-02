import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';
import { LogMessage } from '../../../../../entities';

export function namedFunctionChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  return {
    isChecked:
      lineCodeProcessing.doesContainsNamedFunctionDeclaration(currentLineText),
    metadata: {
      line: selectionLine,
    } as Pick<LogMessage, 'metadata'>,
  };
}
