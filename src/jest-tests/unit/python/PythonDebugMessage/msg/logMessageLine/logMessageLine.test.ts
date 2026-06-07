import { line } from '@/debug-message/python/PythonDebugMessage/msg/logMessageLine/logMessageLine';
import {
  PythonLogMessage,
  PythonLogMessageType,
} from '@/debug-message/python/PythonDebugMessage/msg/logMessage/pythonLogMessageTypes';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';

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
} from '@/debug-message/python/PythonDebugMessage/msg/logMessageLine/helpers';

jest.mock(
  '@/debug-message/python/PythonDebugMessage/msg/logMessageLine/helpers',
);

describe('Python logMessageLine', () => {
  const mockDocument = makeTextDocument(['x = 42'], 'test.py', 'python');
  const program = parseCode(mockDocument);
  const selectionLine = 0;
  const selectedVar = 'x';

  const allHelpers = [
    primitiveAssignmentLine, augmentedAssignmentLine, methodCallAssignmentLine,
    functionCallAssignmentLine, propertyAccessAssignmentLine, arrayElementAssignmentLine,
    binaryExpressionLine, ternaryLine, fStringLine, listComprehensionLine,
    functionParameterLine, withinReturnStatementLine, withinConditionBlockLine,
    withinForLoopLine,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    allHelpers.forEach((h) => (h as jest.Mock).mockReturnValue(selectionLine + 1));
  });

  it('returns selectionLine + 1 for WanderingExpression', () => {
    const logMsg: PythonLogMessage = { logMessageType: PythonLogMessageType.WanderingExpression };
    expect(line(program, mockDocument, selectedVar, selectionLine, logMsg)).toBe(selectionLine + 1);
    allHelpers.forEach((h) => expect(h).not.toHaveBeenCalled());
  });

  it('returns selectionLine + 1 for unknown type', () => {
    const logMsg: PythonLogMessage = { logMessageType: 'Unknown' as PythonLogMessageType };
    expect(line(program, mockDocument, selectedVar, selectionLine, logMsg)).toBe(selectionLine + 1);
  });

  describe('type-to-helper routing', () => {
    const testCases = [
      { type: PythonLogMessageType.PrimitiveAssignment, helper: primitiveAssignmentLine },
      { type: PythonLogMessageType.AugmentedAssignment, helper: augmentedAssignmentLine },
      { type: PythonLogMessageType.MethodCallAssignment, helper: methodCallAssignmentLine },
      { type: PythonLogMessageType.FunctionCallAssignment, helper: functionCallAssignmentLine },
      { type: PythonLogMessageType.PropertyAccessAssignment, helper: propertyAccessAssignmentLine },
      { type: PythonLogMessageType.ArrayElementAssignment, helper: arrayElementAssignmentLine },
      { type: PythonLogMessageType.BinaryExpression, helper: binaryExpressionLine },
      { type: PythonLogMessageType.Ternary, helper: ternaryLine },
      { type: PythonLogMessageType.FString, helper: fStringLine },
      { type: PythonLogMessageType.ListComprehension, helper: listComprehensionLine },
      { type: PythonLogMessageType.FunctionParameter, helper: functionParameterLine },
      { type: PythonLogMessageType.WithinReturnStatement, helper: withinReturnStatementLine },
      { type: PythonLogMessageType.WithinConditionBlock, helper: withinConditionBlockLine },
      { type: PythonLogMessageType.WithinForLoop, helper: withinForLoopLine },
    ];

    for (const { type, helper } of testCases) {
      it(`${type} routes to the correct helper`, () => {
        jest.clearAllMocks();
        allHelpers.forEach((h) => (h as jest.Mock).mockReturnValue(42));
        const logMsg: PythonLogMessage = { logMessageType: type };
        const result = line(program, mockDocument, selectedVar, selectionLine, logMsg);
        expect(helper).toHaveBeenCalledWith(program, mockDocument, selectionLine);
        expect(helper).toHaveBeenCalledTimes(1);
        expect(result).toBe(42);
        allHelpers.filter((h) => h !== helper).forEach((h) => expect(h).not.toHaveBeenCalled());
      });
    }
  });
});
