import { TextDocument } from 'vscode';
import {
  BracketType,
  LogContextMetadata,
  LogMessage,
  LogMessageType,
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
} from './helpers';

export const jsDebugMessageLine: DebugMessageLine = {
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    switch (logMsg.logMessageType) {
      case LogMessageType.PrimitiveAssignment:
        return primitiveAssignmentLine(document, selectionLine);
      case LogMessageType.ObjectLiteral:
        return objectLiteralLine(document, selectionLine);
      case LogMessageType.NamedFunctionAssignment:
        return functionAssignmentLine(document, selectionLine, selectedVar);
      case LogMessageType.Decorator:
        return (
          (getMultiLineContextVariable(
            document,
            selectionLine,
            BracketType.PARENTHESIS,
            false,
          )?.closingContextLine || selectionLine) + 1
        );
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
        return templateStringLine(document, selectionLine);
      case LogMessageType.Ternary:
        return ternaryExpressionLine(document, selectionLine);
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
