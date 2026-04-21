import { line } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine';
import {
  PHPLogMessage,
  PHPLogMessageType,
} from '@/debug-message/php/PHPDebugMessage/msg/logMessage/phpLogMessageTypes';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils/parseCode';

// Import the helpers that we want to mock
import {
  primitiveAssignmentLine,
  arrayAssignmentLine,
  functionCallAssignmentLine,
  objectFunctionCallAssignmentLine,
  propertyAccessAssignmentLine,
  functionParameterLine,
  ternaryLine,
  withinReturnStatementLine,
  propertyMethodCallLine,
  binaryExpressionLine,
  stringInterpolationLine,
  withinConditionBlockLine,
} from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers';

// Mock the entire helpers module
jest.mock(
  '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers',
);

describe('PHP logMessageLine', () => {
  const phpParser = getPhpParser();
  const mockDocument = makeTextDocument(['<?php', '$value = 42;']);
  const selectionLine = 1;
  const selectedVar = '$value';
  const ast = parseCode(mockDocument.getText(), phpParser);

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set default return value for all helper functions
    (primitiveAssignmentLine as jest.Mock).mockReturnValue(2);
    (arrayAssignmentLine as jest.Mock).mockReturnValue(2);
    (functionCallAssignmentLine as jest.Mock).mockReturnValue(2);
    (objectFunctionCallAssignmentLine as jest.Mock).mockReturnValue(2);
    (propertyAccessAssignmentLine as jest.Mock).mockReturnValue(2);
    (functionParameterLine as jest.Mock).mockReturnValue(2);
    (ternaryLine as jest.Mock).mockReturnValue(2);
    (withinReturnStatementLine as jest.Mock).mockReturnValue(1);
    (propertyMethodCallLine as jest.Mock).mockReturnValue(2);
    (binaryExpressionLine as jest.Mock).mockReturnValue(2);
    (stringInterpolationLine as jest.Mock).mockReturnValue(2);
    (withinConditionBlockLine as jest.Mock).mockReturnValue(2);
  });

  it('should return selectionLine + 1 for unknown/default type', () => {
    const logMsg: PHPLogMessage = {
      logMessageType: 'UnknownType' as PHPLogMessageType,
    };

    const result = line(ast, mockDocument, selectedVar, selectionLine, logMsg);

    expect(result).toBe(selectionLine + 1);

    // Verify no helper functions were called
    expect(primitiveAssignmentLine).not.toHaveBeenCalled();
    expect(arrayAssignmentLine).not.toHaveBeenCalled();
    expect(functionCallAssignmentLine).not.toHaveBeenCalled();
    expect(objectFunctionCallAssignmentLine).not.toHaveBeenCalled();
    expect(propertyAccessAssignmentLine).not.toHaveBeenCalled();
    expect(functionParameterLine).not.toHaveBeenCalled();
    expect(ternaryLine).not.toHaveBeenCalled();
    expect(withinReturnStatementLine).not.toHaveBeenCalled();
    expect(propertyMethodCallLine).not.toHaveBeenCalled();
    expect(binaryExpressionLine).not.toHaveBeenCalled();
    expect(stringInterpolationLine).not.toHaveBeenCalled();
    expect(withinConditionBlockLine).not.toHaveBeenCalled();
  });

  it('should return selectionLine + 1 for WanderingExpression type', () => {
    const logMsg: PHPLogMessage = {
      logMessageType: PHPLogMessageType.WanderingExpression,
    };

    const result = line(ast, mockDocument, selectedVar, selectionLine, logMsg);

    expect(result).toBe(selectionLine + 1);

    // Verify no helper functions were called
    expect(primitiveAssignmentLine).not.toHaveBeenCalled();
    expect(arrayAssignmentLine).not.toHaveBeenCalled();
    expect(functionCallAssignmentLine).not.toHaveBeenCalled();
  });

  it('should call the correct helper function for each PHPLogMessageType', () => {
    // Test each PHPLogMessageType to ensure it calls the right helper
    const testCases = [
      {
        type: PHPLogMessageType.WithinReturnStatement,
        helper: withinReturnStatementLine,
      },
      {
        type: PHPLogMessageType.WithinConditionBlock,
        helper: withinConditionBlockLine,
      },
      {
        type: PHPLogMessageType.PrimitiveAssignment,
        helper: primitiveAssignmentLine,
      },
      {
        type: PHPLogMessageType.ArrayAssignment,
        helper: arrayAssignmentLine,
      },
      {
        type: PHPLogMessageType.PropertyAccessAssignment,
        helper: propertyAccessAssignmentLine,
      },
      {
        type: PHPLogMessageType.FunctionCallAssignment,
        helper: functionCallAssignmentLine,
      },
      {
        type: PHPLogMessageType.ObjectFunctionCallAssignment,
        helper: objectFunctionCallAssignmentLine,
      },
      {
        type: PHPLogMessageType.FunctionParameter,
        helper: functionParameterLine,
      },
      {
        type: PHPLogMessageType.PropertyMethodCall,
        helper: propertyMethodCallLine,
      },
      {
        type: PHPLogMessageType.Ternary,
        helper: ternaryLine,
      },
      {
        type: PHPLogMessageType.BinaryExpression,
        helper: binaryExpressionLine,
      },
      {
        type: PHPLogMessageType.StringInterpolation,
        helper: stringInterpolationLine,
      },
    ];

    testCases.forEach(({ type, helper }) => {
      // Reset all mocks
      jest.clearAllMocks();

      const logMsg: PHPLogMessage = { logMessageType: type };
      const expectedLine = 42;
      (helper as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      // All helpers use (ast, document, lineOfSelectedVar, selectedVar)
      expect(helper).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(helper).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedLine);

      // Verify that only the expected helper was called
      const allHelpers = [
        withinReturnStatementLine,
        withinConditionBlockLine,
        primitiveAssignmentLine,
        arrayAssignmentLine,
        propertyAccessAssignmentLine,
        functionCallAssignmentLine,
        objectFunctionCallAssignmentLine,
        functionParameterLine,
        propertyMethodCallLine,
        ternaryLine,
        binaryExpressionLine,
        stringInterpolationLine,
      ];

      allHelpers.forEach((otherHelper) => {
        if (otherHelper !== helper) {
          expect(otherHelper).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('individual type routing', () => {
    it('should route WithinReturnStatement to withinReturnStatementLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.WithinReturnStatement,
      };
      const expectedLine = 10;
      (withinReturnStatementLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(withinReturnStatementLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route WithinConditionBlock to withinConditionBlockLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.WithinConditionBlock,
      };
      const expectedLine = 15;
      (withinConditionBlockLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(withinConditionBlockLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route PrimitiveAssignment to primitiveAssignmentLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.PrimitiveAssignment,
      };
      const expectedLine = 3;
      (primitiveAssignmentLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(primitiveAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route ArrayAssignment to arrayAssignmentLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.ArrayAssignment,
      };
      const expectedLine = 5;
      (arrayAssignmentLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(arrayAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route PropertyAccessAssignment to propertyAccessAssignmentLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.PropertyAccessAssignment,
      };
      const expectedLine = 7;
      (propertyAccessAssignmentLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(propertyAccessAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route FunctionCallAssignment to functionCallAssignmentLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.FunctionCallAssignment,
      };
      const expectedLine = 8;
      (functionCallAssignmentLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(functionCallAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route ObjectFunctionCallAssignment to objectFunctionCallAssignmentLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.ObjectFunctionCallAssignment,
      };
      const expectedLine = 9;
      (objectFunctionCallAssignmentLine as jest.Mock).mockReturnValue(
        expectedLine,
      );

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(objectFunctionCallAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route FunctionParameter to functionParameterLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.FunctionParameter,
      };
      const expectedLine = 11;
      (functionParameterLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(functionParameterLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route PropertyMethodCall to propertyMethodCallLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.PropertyMethodCall,
      };
      const expectedLine = 12;
      (propertyMethodCallLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(propertyMethodCallLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route Ternary to ternaryLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.Ternary,
      };
      const expectedLine = 13;
      (ternaryLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(ternaryLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route BinaryExpression to binaryExpressionLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.BinaryExpression,
      };
      const expectedLine = 14;
      (binaryExpressionLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(binaryExpressionLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should route StringInterpolation to stringInterpolationLine', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.StringInterpolation,
      };
      const expectedLine = 16;
      (stringInterpolationLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      expect(stringInterpolationLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });
  });

  describe('parameter passing', () => {
    it('should pass all parameters correctly to helper functions', () => {
      const customLine = 5;
      const customVar = '$customVar';
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.ArrayAssignment,
      };

      line(ast, mockDocument, customVar, customLine, logMsg);

      expect(arrayAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        customLine,
        customVar,
      );
    });

    it('should handle different AST structures', () => {
      const differentCode = '<?php\n$data = [1, 2, 3];';
      const differentDoc = makeTextDocument(differentCode.split('\n'));
      const differentAst = parseCode(differentCode, phpParser);
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.PrimitiveAssignment,
      };

      line(differentAst, differentDoc, '$data', 1, logMsg);

      expect(primitiveAssignmentLine).toHaveBeenCalledWith(
        differentAst,
        differentDoc,
        1,
        '$data',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle metadata in logMsg', () => {
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.Ternary,
        metadata: {
          lineNumberInBlock: 3,
          blockStartLine: 10,
        },
      };
      const expectedLine = 20;
      (ternaryLine as jest.Mock).mockReturnValue(expectedLine);

      const result = line(
        ast,
        mockDocument,
        selectedVar,
        selectionLine,
        logMsg,
      );

      // Metadata should not affect the routing, only the helper's internal logic
      expect(ternaryLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        selectedVar,
      );
      expect(result).toBe(expectedLine);
    });

    it('should handle complex variable names', () => {
      const complexVar = '$this->user->data[0]';
      const logMsg: PHPLogMessage = {
        logMessageType: PHPLogMessageType.PropertyAccessAssignment,
      };

      line(ast, mockDocument, complexVar, selectionLine, logMsg);

      expect(propertyAccessAssignmentLine).toHaveBeenCalledWith(
        ast,
        mockDocument,
        selectionLine,
        complexVar,
      );
    });
  });
});
