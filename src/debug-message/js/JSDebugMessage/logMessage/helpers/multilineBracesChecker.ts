import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';
import { getMultiLineContextVariable } from '../../../../../utilities';
import { BracketType, LogMessage } from '../../../../../entities';
import { deepObjectProperty } from '../../helpers/deepObjectProperty';

export function multilineBracesChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectedVar: string,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  const multilineBracesVariable = getMultiLineContextVariable(
    document,
    selectionLine,
    BracketType.CURLY_BRACES,
    true,
  );
  const isChecked =
    multilineBracesVariable !== null &&
    !lineCodeProcessing.isAssignedToVariable(currentLineText) &&
    !lineCodeProcessing.isAffectationToVariable(currentLineText);
  // FIXME: No need for multilineBracesVariable !== null since it contribute already in the value of isChecked boolean
  if (isChecked && multilineBracesVariable !== null) {
    const deepObjectPropertyResult = deepObjectProperty(
      document,
      multilineBracesVariable?.openingContextLine,
      selectedVar,
      lineCodeProcessing,
    );
    if (deepObjectPropertyResult) {
      const multilineBracesObjectScope = getMultiLineContextVariable(
        document,
        deepObjectPropertyResult.line,
        BracketType.CURLY_BRACES,
        true,
      );
      return {
        isChecked: true,
        metadata: {
          openingContextLine:
            multilineBracesObjectScope?.openingContextLine as number,
          closingContextLine:
            multilineBracesObjectScope?.closingContextLine as number,
          deepObjectLine: deepObjectPropertyResult.line,
          deepObjectPath: deepObjectPropertyResult.path,
        } as Pick<LogMessage, 'metadata'>,
      };
    }
    return {
      isChecked: true,
      metadata: {
        openingContextLine:
          multilineBracesVariable?.openingContextLine as number,
        closingContextLine:
          multilineBracesVariable?.closingContextLine as number,
      } as Pick<LogMessage, 'metadata'>,
    };
  }
  return {
    isChecked: false,
  };
}
