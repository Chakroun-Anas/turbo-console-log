import { logMessage } from '@/debug-message/python/PythonDebugMessage/msg/logMessage/logMessage';
import { PythonLogMessageType } from '@/debug-message/python/PythonDebugMessage/msg/logMessage/pythonLogMessageTypes';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';

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
} from '@/debug-message/python/PythonDebugMessage/msg/logMessage/helpers';

jest.mock(
  '@/debug-message/python/PythonDebugMessage/msg/logMessage/helpers',
);

describe('Python logMessage', () => {
  const mockDocument = makeTextDocument(['x = 42'], 'test.py', 'python');
  const program = parseCode(mockDocument);
  const selectionLine = 0;
  const selectedVar = 'x';

  const allCheckers = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (pythonLogTypeOrder as jest.Mocked<typeof pythonLogTypeOrder>) = [
      { logMessageType: PythonLogMessageType.FunctionParameter, priority: 1 },
      { logMessageType: PythonLogMessageType.WithinReturnStatement, priority: 2 },
      { logMessageType: PythonLogMessageType.WithinConditionBlock, priority: 3 },
      { logMessageType: PythonLogMessageType.WithinForLoop, priority: 4 },
      { logMessageType: PythonLogMessageType.ListComprehension, priority: 5 },
      { logMessageType: PythonLogMessageType.FString, priority: 6 },
      { logMessageType: PythonLogMessageType.Ternary, priority: 7 },
      { logMessageType: PythonLogMessageType.BinaryExpression, priority: 8 },
      { logMessageType: PythonLogMessageType.MethodCallAssignment, priority: 9 },
      { logMessageType: PythonLogMessageType.FunctionCallAssignment, priority: 10 },
      { logMessageType: PythonLogMessageType.PropertyAccessAssignment, priority: 11 },
      { logMessageType: PythonLogMessageType.ArrayElementAssignment, priority: 12 },
      { logMessageType: PythonLogMessageType.AugmentedAssignment, priority: 13 },
      { logMessageType: PythonLogMessageType.PrimitiveAssignment, priority: 14 },
      { logMessageType: PythonLogMessageType.WanderingExpression, priority: 15 },
    ];
    allCheckers.forEach((c) => (c as jest.Mock).mockReturnValue({ isChecked: false }));
  });

  it('returns first matched checker result', () => {
    (functionParameterChecker as jest.Mock).mockReturnValue({ isChecked: true });
    (primitiveAssignmentChecker as jest.Mock).mockReturnValue({ isChecked: true });
    const result = logMessage(program, mockDocument, selectionLine, selectedVar);
    expect(result.logMessageType).toBe(PythonLogMessageType.FunctionParameter);
    expect(primitiveAssignmentChecker).not.toHaveBeenCalled();
  });

  it('falls back to WanderingExpression when no checker matches', () => {
    const result = logMessage(program, mockDocument, selectionLine, selectedVar);
    expect(result.logMessageType).toBe(PythonLogMessageType.WanderingExpression);
  });

  it('propagates metadata from matched checker', () => {
    (ternaryChecker as jest.Mock).mockReturnValue({ isChecked: true, metadata: { line: 3 } });
    const result = logMessage(program, mockDocument, selectionLine, selectedVar);
    expect(result.logMessageType).toBe(PythonLogMessageType.Ternary);
    expect(result.metadata).toEqual({ line: 3 });
  });

  it('stops calling checkers after first match', () => {
    (withinForLoopChecker as jest.Mock).mockReturnValue({ isChecked: true });
    logMessage(program, mockDocument, selectionLine, selectedVar);
    // checkers before withinForLoopChecker ran, checkers after did not
    expect(functionParameterChecker).toHaveBeenCalledTimes(1);
    expect(withinReturnStatementChecker).toHaveBeenCalledTimes(1);
    expect(withinConditionBlockChecker).toHaveBeenCalledTimes(1);
    expect(withinForLoopChecker).toHaveBeenCalledTimes(1);
    expect(listComprehensionChecker).not.toHaveBeenCalled();
    expect(primitiveAssignmentChecker).not.toHaveBeenCalled();
  });

  describe('checker mapping — each type routes to the correct checker', () => {
    const testCases = [
      { type: PythonLogMessageType.FunctionParameter, checker: functionParameterChecker },
      { type: PythonLogMessageType.WithinReturnStatement, checker: withinReturnStatementChecker },
      { type: PythonLogMessageType.WithinConditionBlock, checker: withinConditionBlockChecker },
      { type: PythonLogMessageType.WithinForLoop, checker: withinForLoopChecker },
      { type: PythonLogMessageType.ListComprehension, checker: listComprehensionChecker },
      { type: PythonLogMessageType.FString, checker: fStringChecker },
      { type: PythonLogMessageType.Ternary, checker: ternaryChecker },
      { type: PythonLogMessageType.BinaryExpression, checker: binaryExpressionChecker },
      { type: PythonLogMessageType.MethodCallAssignment, checker: methodCallAssignmentChecker },
      { type: PythonLogMessageType.FunctionCallAssignment, checker: functionCallAssignmentChecker },
      { type: PythonLogMessageType.PropertyAccessAssignment, checker: propertyAccessAssignmentChecker },
      { type: PythonLogMessageType.ArrayElementAssignment, checker: arrayElementAssignmentChecker },
      { type: PythonLogMessageType.AugmentedAssignment, checker: augmentedAssignmentChecker },
      { type: PythonLogMessageType.PrimitiveAssignment, checker: primitiveAssignmentChecker },
    ];

    for (const { type, checker } of testCases) {
      it(`${type} calls the correct checker`, () => {
        jest.clearAllMocks();
        allCheckers.forEach((c) => (c as jest.Mock).mockReturnValue({ isChecked: false }));
        (pythonLogTypeOrder as jest.Mocked<typeof pythonLogTypeOrder>) = [
          { logMessageType: type, priority: 1 },
        ];
        (checker as jest.Mock).mockReturnValue({ isChecked: true });
        const result = logMessage(program, mockDocument, selectionLine, selectedVar);
        expect(result.logMessageType).toBe(type);
        expect(checker).toHaveBeenCalledWith(program, mockDocument, selectionLine, selectedVar);
        expect(checker).toHaveBeenCalledTimes(1);
      });
    }
  });
});
