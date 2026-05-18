import { getEnclosingContext } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/getEnclosingContext';
import { enclosingBlockName } from '@/debug-message/php/PHPDebugMessage/enclosingBlockName';
import { findEnclosingBlocks } from '@/debug-message/php/PHPDebugMessage/enclosingBlockName/findEnclosingBlocks';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';

// Mock the dependencies
jest.mock('@/debug-message/php/PHPDebugMessage/enclosingBlockName');
jest.mock(
  '@/debug-message/php/PHPDebugMessage/enclosingBlockName/findEnclosingBlocks',
);

describe('PHP getEnclosingContext', () => {
  const phpParser = getPhpParser();

  // Mock functions
  const mockEnclosingBlockName = enclosingBlockName as jest.MockedFunction<
    typeof enclosingBlockName
  >;
  const mockFindEnclosingBlocks = findEnclosingBlocks as jest.MockedFunction<
    typeof findEnclosingBlocks
  >;

  // Test data
  const mockDocument = makeTextDocument(['<?php', '$value = 42;']);
  const ast = parseCode(mockDocument.getText(), phpParser);
  const lineOfSelectedVar = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock return values
    mockEnclosingBlockName.mockReturnValue('');
    mockFindEnclosingBlocks.mockReturnValue({
      className: '',
      functionName: '',
    });
  });

  describe('when both insertEnclosingClass and insertEnclosingFunction are true', () => {
    it('should call findEnclosingBlocks for both class and function in a single traversal', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'UserService',
        functionName: 'create',
      });

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        true,
      );

      // Should use the optimized single-traversal function
      expect(mockFindEnclosingBlocks).toHaveBeenCalledTimes(1);
      expect(mockFindEnclosingBlocks).toHaveBeenCalledWith(
        ast,
        mockDocument,
        lineOfSelectedVar,
      );
      // Should NOT call enclosingBlockName when both are needed
      expect(mockEnclosingBlockName).not.toHaveBeenCalled();
      expect(result).toEqual({
        className: 'UserService',
        functionName: 'create',
      });
    });

    it('should handle empty class and function names', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: '',
        functionName: '',
      });

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        true,
      );

      expect(mockFindEnclosingBlocks).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });

    it('should handle PHP constructor name', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'Product',
        functionName: '__construct',
      });

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        true,
      );

      expect(result).toEqual({
        className: 'Product',
        functionName: '__construct',
      });
    });
  });

  describe('when only insertEnclosingClass is true', () => {
    it('should call enclosingBlockName once for class only', () => {
      mockEnclosingBlockName.mockReturnValue('MyClass');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        false,
      );

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        ast,
        mockDocument,
        lineOfSelectedVar,
        'class',
      );
      expect(mockFindEnclosingBlocks).not.toHaveBeenCalled();
      expect(result).toEqual({
        className: 'MyClass',
        functionName: '',
      });
    });

    it('should return empty function name when only class is requested', () => {
      mockEnclosingBlockName.mockReturnValue('Logger');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        false,
      );

      expect(result.className).toBe('Logger');
      expect(result.functionName).toBe('');
    });

    it('should handle empty class name', () => {
      mockEnclosingBlockName.mockReturnValue('');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        false,
      );

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });
  });

  describe('when only insertEnclosingFunction is true', () => {
    it('should call enclosingBlockName once for function only', () => {
      mockEnclosingBlockName.mockReturnValue('processData');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        true,
      );

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        ast,
        mockDocument,
        lineOfSelectedVar,
        'function',
      );
      expect(mockFindEnclosingBlocks).not.toHaveBeenCalled();
      expect(result).toEqual({
        className: '',
        functionName: 'processData',
      });
    });

    it('should return empty class name when only function is requested', () => {
      mockEnclosingBlockName.mockReturnValue('helper');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        true,
      );

      expect(result.className).toBe('');
      expect(result.functionName).toBe('helper');
    });

    it('should handle PHP method names', () => {
      mockEnclosingBlockName.mockReturnValue('__construct');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        true,
      );

      expect(result.functionName).toBe('__construct');
    });

    it('should handle empty function name', () => {
      mockEnclosingBlockName.mockReturnValue('');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        true,
      );

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });
  });

  describe('when both insertEnclosingClass and insertEnclosingFunction are false', () => {
    it('should not call any helper functions and return empty strings', () => {
      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        false,
      );

      expect(mockEnclosingBlockName).not.toHaveBeenCalled();
      expect(mockFindEnclosingBlocks).not.toHaveBeenCalled();
      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });

    it('should be the fastest path (early exit)', () => {
      // This tests the early exit optimization
      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        false,
      );

      // No mock calls = early exit worked
      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(0);
      expect(mockFindEnclosingBlocks).toHaveBeenCalledTimes(0);
      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });
  });

  describe('optimization verification', () => {
    it('should prefer findEnclosingBlocks over two separate calls when both are needed', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'Service',
        functionName: 'execute',
      });

      getEnclosingContext(ast, mockDocument, lineOfSelectedVar, true, true);

      // Verify the optimized path was taken (1 call vs 2)
      expect(mockFindEnclosingBlocks).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(0);
    });

    it('should use single call for single block type requests', () => {
      mockEnclosingBlockName.mockReturnValue('TestClass');

      getEnclosingContext(ast, mockDocument, lineOfSelectedVar, true, false);

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockFindEnclosingBlocks).toHaveBeenCalledTimes(0);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical class method context', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'UserController',
        functionName: 'store',
      });

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        true,
      );

      expect(result).toEqual({
        className: 'UserController',
        functionName: 'store',
      });
    });

    it('should handle global function context (no class)', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: '',
        functionName: 'array_map_callback',
      });

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        true,
      );

      expect(result).toEqual({
        className: '',
        functionName: 'array_map_callback',
      });
    });

    it('should handle class property context (no function)', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'Config',
        functionName: '',
      });

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        true,
      );

      expect(result).toEqual({
        className: 'Config',
        functionName: '',
      });
    });
  });
});
