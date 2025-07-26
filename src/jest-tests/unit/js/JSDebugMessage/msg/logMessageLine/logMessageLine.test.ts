import ts from 'typescript';
import { line } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine';
import { LogMessage, LogMessageType } from '@/entities';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';

// Import the helpers that we want to mock
import {
  ternaryExpressionLine,
  objectLiteralLine,
  functionAssignmentLine,
  functionCallLine,
  arrayLine,
  templateStringLine,
  primitiveAssignmentLine,
  propertyAccessAssignmentLine,
  binaryExpressionLine,
  rawPropertyAccessLine,
  propertyMethodCallLine,
  functionParameterLine,
  withinReturnStatementLine,
} from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';

// Mock the entire helpers module
jest.mock('@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers');

describe('logMessageLine', () => {
  const mockDocument = makeTextDocument(['const value = 42;']);
  const sourceFile = ts.createSourceFile(
    mockDocument.fileName,
    mockDocument.getText(),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const selectionLine = 0;
  const selectedVar = 'value';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set default return value for all helper functions
    (ternaryExpressionLine as jest.Mock).mockReturnValue(1);
    (objectLiteralLine as jest.Mock).mockReturnValue(1);
    (functionAssignmentLine as jest.Mock).mockReturnValue(1);
    (functionCallLine as jest.Mock).mockReturnValue(1);
    (arrayLine as jest.Mock).mockReturnValue(1);
    (templateStringLine as jest.Mock).mockReturnValue(1);
    (primitiveAssignmentLine as jest.Mock).mockReturnValue(1);
    (propertyAccessAssignmentLine as jest.Mock).mockReturnValue(1);
    (binaryExpressionLine as jest.Mock).mockReturnValue(1);
    (rawPropertyAccessLine as jest.Mock).mockReturnValue(1);
    (propertyMethodCallLine as jest.Mock).mockReturnValue(1);
    (functionParameterLine as jest.Mock).mockReturnValue(1);
    (withinReturnStatementLine as jest.Mock).mockReturnValue(1);
  });

  it('should return selectionLine + 1 for unknown/default type', () => {
    const logMsg: LogMessage = {
      logMessageType: 'UnknownType' as LogMessageType,
    };

    const result = line(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
      logMsg,
    );

    expect(result).toBe(selectionLine + 1);

    // Verify no helper functions were called
    expect(ternaryExpressionLine).not.toHaveBeenCalled();
    expect(objectLiteralLine).not.toHaveBeenCalled();
    expect(functionAssignmentLine).not.toHaveBeenCalled();
    expect(functionCallLine).not.toHaveBeenCalled();
    expect(arrayLine).not.toHaveBeenCalled();
    expect(templateStringLine).not.toHaveBeenCalled();
    expect(primitiveAssignmentLine).not.toHaveBeenCalled();
    expect(propertyAccessAssignmentLine).not.toHaveBeenCalled();
    expect(binaryExpressionLine).not.toHaveBeenCalled();
    expect(rawPropertyAccessLine).not.toHaveBeenCalled();
    expect(propertyMethodCallLine).not.toHaveBeenCalled();
    expect(functionParameterLine).not.toHaveBeenCalled();
    expect(withinReturnStatementLine).not.toHaveBeenCalled();
  });

  it('should call the correct helper function for each LogMessageType', () => {
    // Test each LogMessageType to ensure it calls the right helper
    const testCases = [
      {
        type: LogMessageType.WithinReturnStatement,
        helper: withinReturnStatementLine,
      },
      {
        type: LogMessageType.PrimitiveAssignment,
        helper: primitiveAssignmentLine,
      },
      {
        type: LogMessageType.PropertyAccessAssignment,
        helper: propertyAccessAssignmentLine,
      },
      {
        type: LogMessageType.FunctionParameter,
        helper: functionParameterLine,
      },
      {
        type: LogMessageType.ObjectLiteral,
        helper: objectLiteralLine,
      },
      {
        type: LogMessageType.NamedFunctionAssignment,
        helper: functionAssignmentLine,
      },
      {
        type: LogMessageType.ObjectFunctionCallAssignment,
        helper: functionCallLine,
      },
      {
        type: LogMessageType.FunctionCallAssignment,
        helper: functionCallLine,
      },
      {
        type: LogMessageType.ArrayAssignment,
        helper: arrayLine,
      },
      {
        type: LogMessageType.RawPropertyAccess,
        helper: rawPropertyAccessLine,
      },
      {
        type: LogMessageType.PropertyMethodCall,
        helper: propertyMethodCallLine,
      },
      {
        type: LogMessageType.TemplateString,
        helper: templateStringLine,
      },
      {
        type: LogMessageType.BinaryExpression,
        helper: binaryExpressionLine,
      },
      {
        type: LogMessageType.Ternary,
        helper: ternaryExpressionLine,
      },
    ];

    testCases.forEach(({ type, helper }) => {
      // Reset all mocks
      jest.clearAllMocks();

      const logMsg: LogMessage = { logMessageType: type };
      const expectedLine = 42;
      (helper as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        sourceFile,
        mockDocument,
        selectionLine,
        selectedVar,
        logMsg,
      );

      expect(helper).toHaveBeenCalledWith(
        sourceFile,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(helper).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedLine);

      // Verify that only the expected helper was called
      const allHelpers = [
        withinReturnStatementLine,
        primitiveAssignmentLine,
        propertyAccessAssignmentLine,
        functionParameterLine,
        objectLiteralLine,
        functionAssignmentLine,
        functionCallLine,
        arrayLine,
        rawPropertyAccessLine,
        propertyMethodCallLine,
        templateStringLine,
        binaryExpressionLine,
        ternaryExpressionLine,
      ];

      allHelpers.forEach((otherHelper) => {
        if (otherHelper !== helper) {
          expect(otherHelper).not.toHaveBeenCalled();
        }
      });
    });
  });
});
