import { logMessage } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/logMessage';
import { PHPLogMessageType } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/phpLogMessageTypes';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils/parseCode';

// Import the helpers that we want to mock
import {
  arrayAssignmentChecker,
  binaryExpressionChecker,
  functionCallAssignmentChecker,
  functionParameterChecker,
  objectFunctionCallAssignmentChecker,
  primitiveAssignmentChecker,
  propertyAccessAssignmentChecker,
  stringInterpolationChecker,
  ternaryChecker,
  propertyMethodCallChecker,
  withinReturnStatementChecker,
  withinConditionBlockChecker,
  phpLogTypeOrder,
} from '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers';

// Mock the entire helpers module
jest.mock(
  '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers',
);

describe('PHP logMessage', () => {
  const phpParser = getPhpParser();
  const mockDocument = makeTextDocument(['<?php', '$value = 42;']);
  const code = mockDocument.getText();
  const ast = parseCode(code, phpParser);
  const selectionLine = 1; // Line with $value = 42;
  const selectedVar = '$value';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock phpLogTypeOrder to control the order of checker execution
    (phpLogTypeOrder as jest.Mocked<typeof phpLogTypeOrder>) = [
      { logMessageType: PHPLogMessageType.FunctionParameter, priority: 1 },
      {
        logMessageType: PHPLogMessageType.ObjectFunctionCallAssignment,
        priority: 2,
      },
      { logMessageType: PHPLogMessageType.FunctionCallAssignment, priority: 3 },
      {
        logMessageType: PHPLogMessageType.PropertyAccessAssignment,
        priority: 4,
      },
      { logMessageType: PHPLogMessageType.ArrayAssignment, priority: 5 },
      { logMessageType: PHPLogMessageType.StringInterpolation, priority: 6 },
      { logMessageType: PHPLogMessageType.Ternary, priority: 7 },
      { logMessageType: PHPLogMessageType.BinaryExpression, priority: 8 },
      { logMessageType: PHPLogMessageType.PropertyMethodCall, priority: 9 },
      { logMessageType: PHPLogMessageType.PrimitiveAssignment, priority: 10 },
      {
        logMessageType: PHPLogMessageType.WithinConditionBlock,
        priority: 11,
      },
      {
        logMessageType: PHPLogMessageType.WithinReturnStatement,
        priority: 12,
      },
      { logMessageType: PHPLogMessageType.WanderingExpression, priority: 13 },
    ];

    // Set default return value for all checkers
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
    (primitiveAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (propertyAccessAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (stringInterpolationChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (ternaryChecker as jest.Mock).mockReturnValue({ isChecked: false });
    (propertyMethodCallChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (withinReturnStatementChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
    (withinConditionBlockChecker as jest.Mock).mockReturnValue({
      isChecked: false,
    });
  });

  it('should return the first matched checker result', () => {
    // Test that the first checker in priority order wins
    (functionParameterChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });
    (arrayAssignmentChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.FunctionParameter);
    expect(functionParameterChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    // Should NOT call arrayAssignmentChecker since functionParameterChecker matched first
    expect(arrayAssignmentChecker).not.toHaveBeenCalled();
  });

  it('should return the correct type for array assignment', () => {
    (arrayAssignmentChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.ArrayAssignment);
    expect(arrayAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for binary expression', () => {
    (binaryExpressionChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.BinaryExpression);
    expect(binaryExpressionChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for function call assignment', () => {
    (functionCallAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(
      PHPLogMessageType.FunctionCallAssignment,
    );
    expect(functionCallAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for object function call assignment', () => {
    (objectFunctionCallAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(
      PHPLogMessageType.ObjectFunctionCallAssignment,
    );
    expect(objectFunctionCallAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for property access assignment', () => {
    (propertyAccessAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(
      PHPLogMessageType.PropertyAccessAssignment,
    );
    expect(propertyAccessAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for primitive assignment', () => {
    (primitiveAssignmentChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.PrimitiveAssignment);
    expect(primitiveAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for string interpolation', () => {
    (stringInterpolationChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.StringInterpolation);
    expect(stringInterpolationChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for ternary expression', () => {
    (ternaryChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.Ternary);
    expect(ternaryChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for property method call', () => {
    (propertyMethodCallChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.PropertyMethodCall);
    expect(propertyMethodCallChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for within return statement', () => {
    (withinReturnStatementChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.WithinReturnStatement);
    expect(withinReturnStatementChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should return the correct type for within condition block', () => {
    (withinConditionBlockChecker as jest.Mock).mockReturnValue({
      isChecked: true,
    });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.WithinConditionBlock);
    expect(withinConditionBlockChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
  });

  it('should default to PrimitiveAssignment if no checker matches', () => {
    // All checkers return false by default from beforeEach

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.PrimitiveAssignment);
  });

  it('should call all checkers in priority order until one matches', () => {
    // Set the 5th checker to match (ArrayAssignment)
    (arrayAssignmentChecker as jest.Mock).mockReturnValue({ isChecked: true });

    const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

    expect(result.logMessageType).toBe(PHPLogMessageType.ArrayAssignment);

    // Should call checkers in order until match
    expect(functionParameterChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(objectFunctionCallAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(functionCallAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(propertyAccessAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );
    expect(arrayAssignmentChecker).toHaveBeenCalledWith(
      ast,
      mockDocument,
      selectionLine,
      selectedVar,
    );

    // Should NOT call checkers after the match
    expect(stringInterpolationChecker).not.toHaveBeenCalled();
    expect(ternaryChecker).not.toHaveBeenCalled();
    expect(binaryExpressionChecker).not.toHaveBeenCalled();
    expect(primitiveAssignmentChecker).not.toHaveBeenCalled();
  });

  describe('checker mapping verification', () => {
    it('should call the correct checker function for each PHPLogMessageType', () => {
      // Test each PHPLogMessageType to ensure it calls the right checker
      const testCases = [
        {
          type: PHPLogMessageType.FunctionParameter,
          checker: functionParameterChecker,
        },
        {
          type: PHPLogMessageType.ObjectFunctionCallAssignment,
          checker: objectFunctionCallAssignmentChecker,
        },
        {
          type: PHPLogMessageType.FunctionCallAssignment,
          checker: functionCallAssignmentChecker,
        },
        {
          type: PHPLogMessageType.PropertyAccessAssignment,
          checker: propertyAccessAssignmentChecker,
        },
        {
          type: PHPLogMessageType.ArrayAssignment,
          checker: arrayAssignmentChecker,
        },
        {
          type: PHPLogMessageType.StringInterpolation,
          checker: stringInterpolationChecker,
        },
        { type: PHPLogMessageType.Ternary, checker: ternaryChecker },
        {
          type: PHPLogMessageType.BinaryExpression,
          checker: binaryExpressionChecker,
        },
        {
          type: PHPLogMessageType.PropertyMethodCall,
          checker: propertyMethodCallChecker,
        },
        {
          type: PHPLogMessageType.PrimitiveAssignment,
          checker: primitiveAssignmentChecker,
        },
        {
          type: PHPLogMessageType.WithinConditionBlock,
          checker: withinConditionBlockChecker,
        },
        {
          type: PHPLogMessageType.WithinReturnStatement,
          checker: withinReturnStatementChecker,
        },
      ];

      testCases.forEach(({ type, checker }) => {
        // Reset all mocks
        jest.clearAllMocks();

        // Set up phpLogTypeOrder to only check this specific type
        (phpLogTypeOrder as jest.Mocked<typeof phpLogTypeOrder>) = [
          { logMessageType: type, priority: 1 },
        ];

        // Make the specific checker return true
        (checker as jest.Mock).mockReturnValue({ isChecked: true });

        const result = logMessage(
          ast,
          mockDocument,
          selectionLine,
          selectedVar,
        );

        expect(result.logMessageType).toBe(type);

        // All PHP checkers use (ast, document, selectionLine, selectedVar)
        expect(checker).toHaveBeenCalledWith(
          ast,
          mockDocument,
          selectionLine,
          selectedVar,
        );

        expect(checker).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('metadata handling', () => {
    it('should return metadata when checker provides it', () => {
      const mockMetadata = {
        lineNumberInBlock: 5,
        blockStartLine: 10,
      };

      (ternaryChecker as jest.Mock).mockReturnValue({
        isChecked: true,
        metadata: mockMetadata,
      });

      const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

      expect(result.logMessageType).toBe(PHPLogMessageType.Ternary);
      expect(result.metadata).toEqual(mockMetadata);
    });

    it('should handle missing metadata gracefully', () => {
      (primitiveAssignmentChecker as jest.Mock).mockReturnValue({
        isChecked: true,
        // No metadata field
      });

      const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

      expect(result.logMessageType).toBe(PHPLogMessageType.PrimitiveAssignment);
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined AST gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nullAst = null as any;

      const result = logMessage(
        nullAst,
        mockDocument,
        selectionLine,
        selectedVar,
      );

      // Should still call checkers and return default
      expect(result.logMessageType).toBe(PHPLogMessageType.PrimitiveAssignment);
    });

    it('should handle empty selected variable', () => {
      const result = logMessage(ast, mockDocument, selectionLine, '');

      // Should still call checkers and return default
      expect(result.logMessageType).toBe(PHPLogMessageType.PrimitiveAssignment);
    });

    it('should handle invalid selection line', () => {
      const result = logMessage(ast, mockDocument, -1, selectedVar);

      // Should still call checkers and return default
      expect(result.logMessageType).toBe(PHPLogMessageType.PrimitiveAssignment);
    });
  });

  describe('priority system', () => {
    it('should respect priority order when multiple checkers could match', () => {
      // Simulate a scenario where multiple checkers return true
      (functionParameterChecker as jest.Mock).mockReturnValue({
        isChecked: true,
      });
      (arrayAssignmentChecker as jest.Mock).mockReturnValue({
        isChecked: true,
      });
      (primitiveAssignmentChecker as jest.Mock).mockReturnValue({
        isChecked: true,
      });

      const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

      // Should return the first one in priority order (FunctionParameter has priority 1)
      expect(result.logMessageType).toBe(PHPLogMessageType.FunctionParameter);

      // Should only call the first checker
      expect(functionParameterChecker).toHaveBeenCalledTimes(1);
      expect(arrayAssignmentChecker).not.toHaveBeenCalled();
      expect(primitiveAssignmentChecker).not.toHaveBeenCalled();
    });

    it('should continue checking until a match is found', () => {
      // First 3 checkers return false, 4th returns true
      (functionParameterChecker as jest.Mock).mockReturnValue({
        isChecked: false,
      });
      (objectFunctionCallAssignmentChecker as jest.Mock).mockReturnValue({
        isChecked: false,
      });
      (functionCallAssignmentChecker as jest.Mock).mockReturnValue({
        isChecked: false,
      });
      (propertyAccessAssignmentChecker as jest.Mock).mockReturnValue({
        isChecked: true,
      });

      const result = logMessage(ast, mockDocument, selectionLine, selectedVar);

      expect(result.logMessageType).toBe(
        PHPLogMessageType.PropertyAccessAssignment,
      );

      // Should have called the first 4 checkers
      expect(functionParameterChecker).toHaveBeenCalledTimes(1);
      expect(objectFunctionCallAssignmentChecker).toHaveBeenCalledTimes(1);
      expect(functionCallAssignmentChecker).toHaveBeenCalledTimes(1);
      expect(propertyAccessAssignmentChecker).toHaveBeenCalledTimes(1);

      // Should NOT call subsequent checkers
      expect(arrayAssignmentChecker).not.toHaveBeenCalled();
    });
  });
});
