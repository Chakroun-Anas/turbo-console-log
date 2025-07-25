import ts from 'typescript';
import { logMessage } from '@/debug-message/js/JSDebugMessage/msg/logMessage/logMessage';
import { LogMessageType } from '@/entities';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';

// Import the helpers that we want to mock
import {
  arrayAssignmentChecker,
  binaryExpressionChecker,
  functionCallAssignmentChecker,
  functionParameterChecker,
  namedFunctionAssignmentChecker,
  objectFunctionCallAssignmentChecker,
  objectLiteralChecker,
  primitiveAssignmentChecker,
  propertyAccessAssignmentChecker,
  templateStringChecker,
  ternaryChecker,
  rawPropertyAccessChecker,
  propertyMethodCallChecker,
  logTypeOrder,
} from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers';

// Mock the entire helpers module
jest.mock('@/debug-message/js/JSDebugMessage/msg/logMessage/helpers');

describe('logMessage', () => {
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

    // Mock logTypeOrder to control the order of checker execution
    (logTypeOrder as jest.Mocked<typeof logTypeOrder>) = [
      { logMessageType: LogMessageType.ArrayAssignment, priority: 1 },
      { logMessageType: LogMessageType.BinaryExpression, priority: 2 },
      { logMessageType: LogMessageType.FunctionCallAssignment, priority: 3 },
      { logMessageType: LogMessageType.FunctionParameter, priority: 4 },
      { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 5 },
      {
        logMessageType: LogMessageType.ObjectFunctionCallAssignment,
        priority: 6,
      },
      { logMessageType: LogMessageType.ObjectLiteral, priority: 7 },
      { logMessageType: LogMessageType.PropertyAccessAssignment, priority: 8 },
      { logMessageType: LogMessageType.TemplateString, priority: 9 },
      { logMessageType: LogMessageType.Ternary, priority: 10 },
      { logMessageType: LogMessageType.RawPropertyAccess, priority: 11 },
      { logMessageType: LogMessageType.PropertyMethodCall, priority: 12 },
      { logMessageType: LogMessageType.PrimitiveAssignment, priority: 13 },
    ];

    // Set default return value for all checkers
    // Most checkers return only { isChecked: boolean }
    (arrayAssignmentChecker as jest.Mock).mockReturnValue({ isChecked: false });
    (binaryExpressionChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (functionCallAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (functionParameterChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (objectFunctionCallAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (objectLiteralChecker as jest.Mock).mockReturnValue({ isChecked: false });
    (primitiveAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (propertyAccessAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (templateStringChecker as jest.Mock).mockReturnValue({ isChecked: false });
    (ternaryChecker as jest.Mock).mockReturnValue({ isChecked: false });
    (propertyMethodCallChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });

    // These checkers return { isChecked: boolean, metadata?: ... }
    (namedFunctionAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (rawPropertyAccessChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
  });

  it('should return the first matched checker result', () => {
    // Test that the first checker in priority order wins
    (arrayAssignmentChecker as jest.Mock).mockReturnValue({ isChecked: true });
    (binaryExpressionChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(LogMessageType.ArrayAssignment);
    expect(arrayAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    // Should NOT call binaryExpressionChecker since arrayAssignmentChecker matched first
    expect(binaryExpressionChecker).not.toHaveBeenCalled();
  });

  it('should return the correct type for binary expression', () => {
    (binaryExpressionChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(LogMessageType.BinaryExpression);
    expect(binaryExpressionChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for function call assignment', () => {
    (functionCallAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(LogMessageType.FunctionCallAssignment);
    expect(functionCallAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for primitive assignment', () => {
    (primitiveAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(LogMessageType.PrimitiveAssignment);
    expect(primitiveAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for ternary expression', () => {
    (ternaryChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(LogMessageType.Ternary);
    expect(ternaryChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should default to PrimitiveAssignment if no checker matches', () => {
    // All checkers return false by default from beforeEach

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(LogMessageType.PrimitiveAssignment);
  });

  it('should call all checkers in priority order until one matches', () => {
    // Set the 5th checker to match
    (objectFunctionCallAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    expect(result.logMessageType).toBe(
      LogMessageType.ObjectFunctionCallAssignment,
    );

    // Should call checkers in order until match
    expect(arrayAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(binaryExpressionChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(functionCallAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(functionParameterChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(namedFunctionAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(objectFunctionCallAssignmentChecker).toHaveBeenCalledWith(
      sourceFile,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    // Should NOT call checkers after the match
    expect(objectLiteralChecker).not.toHaveBeenCalled();
    expect(primitiveAssignmentChecker).not.toHaveBeenCalled();
  });

  describe('checker mapping verification', () => {
    it('should call the correct checker function for each LogMessageType', () => {
      // Test each LogMessageType to ensure it calls the right checker
      const testCases = [
        {
          type: LogMessageType.ArrayAssignment,
          checker: arrayAssignmentChecker,
        },
        {
          type: LogMessageType.BinaryExpression,
          checker: binaryExpressionChecker,
        },
        {
          type: LogMessageType.FunctionCallAssignment,
          checker: functionCallAssignmentChecker,
        },
        {
          type: LogMessageType.FunctionParameter,
          checker: functionParameterChecker,
        },
        {
          type: LogMessageType.NamedFunctionAssignment,
          checker: namedFunctionAssignmentChecker,
        },
        {
          type: LogMessageType.ObjectFunctionCallAssignment,
          checker: objectFunctionCallAssignmentChecker,
        },
        { type: LogMessageType.ObjectLiteral, checker: objectLiteralChecker },
        {
          type: LogMessageType.PrimitiveAssignment,
          checker: primitiveAssignmentChecker,
        },
        {
          type: LogMessageType.PropertyAccessAssignment,
          checker: propertyAccessAssignmentChecker,
        },
        { type: LogMessageType.TemplateString, checker: templateStringChecker },
        { type: LogMessageType.Ternary, checker: ternaryChecker },
        {
          type: LogMessageType.RawPropertyAccess,
          checker: rawPropertyAccessChecker,
        },
        {
          type: LogMessageType.PropertyMethodCall,
          checker: propertyMethodCallChecker,
        },
      ];

      testCases.forEach(({ type, checker }) => {
        // Reset all mocks
        jest.clearAllMocks();

        // Set up logTypeOrder to only check this specific type
        (logTypeOrder as jest.Mocked<typeof logTypeOrder>) = [
          { logMessageType: type, priority: 1 },
        ];

        // Make the specific checker return true
        (checker as jest.Mock).mockReturnValue({ isChecked: true });

        const result = logMessage(
          sourceFile,
          mockDocument,
          selectionLine,
          selectedVar,
        );

        expect(result.logMessageType).toBe(type);
        expect(checker).toHaveBeenCalledWith(
          sourceFile,
          mockDocument,
          selectionLine,
          selectedVar,
        );
        expect(checker).toHaveBeenCalledTimes(1);
      });
    });
  });
});
