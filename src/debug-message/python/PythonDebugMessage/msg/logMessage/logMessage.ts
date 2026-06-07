import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../python-parser-utils/types';
import {
  PythonLogMessageType,
  type PythonLogMessage,
  type PythonLogMessageCheckerResult,
} from './pythonLogMessageTypes';
import {
  pythonLogTypeOrder,
  functionParameterChecker,
  withinReturnStatementChecker,
  withinConditionBlockChecker,
  withinForLoopChecker,
  listComprehensionChecker,
  fStringChecker,
  ternaryChecker,
  binaryExpressionChecker,
  methodCallAssignmentChecker,
  functionCallAssignmentChecker,
  propertyAccessAssignmentChecker,
  arrayElementAssignmentChecker,
  augmentedAssignmentChecker,
  primitiveAssignmentChecker,
} from './helpers';

export function logMessage(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessage {
  const checkers: Record<
    PythonLogMessageType,
    () => PythonLogMessageCheckerResult
  > = {
    [PythonLogMessageType.FunctionParameter]: () =>
      functionParameterChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.WithinReturnStatement]: () =>
      withinReturnStatementChecker(
        program,
        document,
        selectionLine,
        selectedVar,
      ),
    [PythonLogMessageType.WithinConditionBlock]: () =>
      withinConditionBlockChecker(
        program,
        document,
        selectionLine,
        selectedVar,
      ),
    [PythonLogMessageType.WithinForLoop]: () =>
      withinForLoopChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.ListComprehension]: () =>
      listComprehensionChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.FString]: () =>
      fStringChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.Ternary]: () =>
      ternaryChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.BinaryExpression]: () =>
      binaryExpressionChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.MethodCallAssignment]: () =>
      methodCallAssignmentChecker(
        program,
        document,
        selectionLine,
        selectedVar,
      ),
    [PythonLogMessageType.FunctionCallAssignment]: () =>
      functionCallAssignmentChecker(
        program,
        document,
        selectionLine,
        selectedVar,
      ),
    [PythonLogMessageType.PropertyAccessAssignment]: () =>
      propertyAccessAssignmentChecker(
        program,
        document,
        selectionLine,
        selectedVar,
      ),
    [PythonLogMessageType.ArrayElementAssignment]: () =>
      arrayElementAssignmentChecker(
        program,
        document,
        selectionLine,
        selectedVar,
      ),
    [PythonLogMessageType.AugmentedAssignment]: () =>
      augmentedAssignmentChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.PrimitiveAssignment]: () =>
      primitiveAssignmentChecker(program, document, selectionLine, selectedVar),
    [PythonLogMessageType.WanderingExpression]: () => ({ isChecked: false }),
  };

  for (const { logMessageType } of pythonLogTypeOrder) {
    const { isChecked, metadata } = checkers[logMessageType]();
    if (isChecked) {
      return { logMessageType, metadata };
    }
  }

  return { logMessageType: PythonLogMessageType.WanderingExpression };
}
