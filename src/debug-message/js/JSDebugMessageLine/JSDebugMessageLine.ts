import { TextDocument } from 'vscode';
import {
  BracketType,
  LogContextMetadata,
  LogMessage,
  LogMessageType,
  MultilineContextVariable,
} from '../../../entities';
import { DebugMessageLine } from '../../DebugMessageLine';
import { getMultiLineContextVariable } from '../../../utilities';
import {
  ternaryExpressionLine,
  objectLiteralLine,
  functionAssignmentLine,
  functionClosedLine,
  functionCallLine,
  arrayLine,
  templateStringLine,
  nullishCoalescingLine,
  primitiveAssignmentLine,
  typedFunctionCallLine,
  multilineBracesLine,
  propertyAccessAssignmentLine,
} from './helpers';

/**
 * Function to check if the selection line is within a return statement
 * @param document
 * @param selectionLine
 * @returns Line number of the return statement if the selection line is within a return statement, -1 otherwise
 */
function isWithinReturnStatement(
  document: TextDocument,
  selectionLine: number,
  logMsg: LogMessage,
): number {
  if (
    [
      LogMessageType.NamedFunctionAssignment,
      LogMessageType.FunctionParameter,
    ].includes(logMsg.logMessageType)
  ) {
    return -1;
  }
  const multilineBracesVariable: MultilineContextVariable | null =
    getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.CURLY_BRACES,
      true,
    );
  const multilineParenthesisVariable: MultilineContextVariable | null =
    getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.PARENTHESIS,
      false,
    );
  if (!multilineBracesVariable && !multilineParenthesisVariable) {
    if (document.lineAt(selectionLine).text.trim().startsWith('return')) {
      return selectionLine;
    }
    return -1;
  }
  let currentLine = selectionLine;
  let foundReturnLine = -1;
  const maxScanLine = Math.max(
    multilineBracesVariable?.openingContextLine || 0,
    multilineParenthesisVariable?.openingContextLine || 0,
  );

  // Scan backward to find the start of the return statement
  while (currentLine >= maxScanLine) {
    const lineText = document.lineAt(currentLine).text.trim();

    if (lineText.startsWith('return')) {
      foundReturnLine = currentLine; // Mark return line
      break;
    }

    currentLine--;
  }

  return foundReturnLine;
}

export const jsDebugMessageLine: DebugMessageLine = {
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    const returnStatementLine = isWithinReturnStatement(
      document,
      selectionLine,
      logMsg,
    );
    if (returnStatementLine !== -1) {
      return returnStatementLine;
    }
    switch (logMsg.logMessageType) {
      case LogMessageType.PrimitiveAssignment:
        return primitiveAssignmentLine(document, selectionLine);
      case LogMessageType.PropertyAccessAssignment:
        return propertyAccessAssignmentLine(document, selectionLine);
      case LogMessageType.FunctionParameter:
        return (
          (logMsg?.metadata as LogContextMetadata)?.closingContextLine ||
          selectionLine + 1
        );
      case LogMessageType.ObjectLiteral:
        return objectLiteralLine(document, selectionLine);
      case LogMessageType.NamedFunctionAssignment:
        return functionAssignmentLine(document, selectionLine, selectedVar);
      case LogMessageType.MultiLineAnonymousFunction:
        return (
          functionClosedLine(
            document,
            selectionLine,
            BracketType.CURLY_BRACES,
          ) + 1
        );
      case LogMessageType.ObjectFunctionCallAssignment:
        return functionCallLine(document, selectionLine);
      case LogMessageType.FunctionCallAssignment:
        return functionCallLine(document, selectionLine);
      case LogMessageType.TypedFunctionCallAssignment:
        return typedFunctionCallLine(document, selectionLine);
      case LogMessageType.ArrayAssignment:
        return arrayLine(document, selectionLine);
      case LogMessageType.MultilineParenthesis:
        return (
          ((logMsg?.metadata as LogContextMetadata)?.closingContextLine ||
            selectionLine) + 1
        );
      case LogMessageType.TemplateString:
        return templateStringLine(document, selectionLine, selectedVar);
      case LogMessageType.Ternary:
        return ternaryExpressionLine(document, selectionLine, selectedVar);
      case LogMessageType.NullishCoalescing:
        return nullishCoalescingLine(document, selectionLine);
      case LogMessageType.MultilineBraces:
        return multilineBracesLine(
          selectedVar,
          selectionLine,
          (logMsg?.metadata as LogContextMetadata)?.closingContextLine,
        );
      default:
        return selectionLine + 1;
    }
  },
};
