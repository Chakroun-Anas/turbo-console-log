import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../python-parser-utils/types';
import type { PythonLogMessage } from '../logMessage/pythonLogMessageTypes';
import { PythonLogMessageType } from '../logMessage/pythonLogMessageTypes';
import { wanderingExpressionLine } from '../python-parser-utils/walk';
import {
  primitiveAssignmentLine,
  augmentedAssignmentLine,
  methodCallAssignmentLine,
  functionCallAssignmentLine,
  propertyAccessAssignmentLine,
  arrayElementAssignmentLine,
  binaryExpressionLine,
  ternaryLine,
  fStringLine,
  listComprehensionLine,
  functionParameterLine,
  withinReturnStatementLine,
  withinConditionBlockLine,
  withinForLoopLine,
} from './helpers';

export function line(
  program: PythonProgram,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  logMsg: PythonLogMessage,
): number {
  switch (logMsg.logMessageType) {
    case PythonLogMessageType.FunctionParameter:
      return functionParameterLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.WithinReturnStatement:
      return withinReturnStatementLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.WithinConditionBlock:
      return withinConditionBlockLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.WithinForLoop:
      return withinForLoopLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.ListComprehension:
      return listComprehensionLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.FString:
      return fStringLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.Ternary:
      return ternaryLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.BinaryExpression:
      return binaryExpressionLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.MethodCallAssignment:
      return methodCallAssignmentLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.FunctionCallAssignment:
      return functionCallAssignmentLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.PropertyAccessAssignment:
      return propertyAccessAssignmentLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.ArrayElementAssignment:
      return arrayElementAssignmentLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.AugmentedAssignment:
      return augmentedAssignmentLine(program, document, lineOfSelectedVar);

    case PythonLogMessageType.PrimitiveAssignment:
      return primitiveAssignmentLine(program, document, lineOfSelectedVar);

    // WanderingExpression and unknown types. Handles multi-line fall-through RHS
    // (parenthesized exprs, dict/list/set/tuple literals → after the statement),
    // plus header-bound variables (`with … as`, `except … as`, `case` patterns →
    // into the clause body) and the `match` subject (→ before the match).
    default:
      return wanderingExpressionLine(program, lineOfSelectedVar);
  }
}
