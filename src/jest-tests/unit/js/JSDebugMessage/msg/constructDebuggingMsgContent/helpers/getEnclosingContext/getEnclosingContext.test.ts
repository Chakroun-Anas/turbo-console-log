import { getEnclosingContext } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/getEnclosingContext';
import { enclosingBlockName } from '@/debug-message/js/JSDebugMessage/enclosingBlockName';
import { findEnclosingBlocks } from '@/debug-message/js/JSDebugMessage/enclosingBlockName/findEnclosingBlocks';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';

// Mock the dependencies
jest.mock('@/debug-message/js/JSDebugMessage/enclosingBlockName');
jest.mock(
  '@/debug-message/js/JSDebugMessage/enclosingBlockName/findEnclosingBlocks',
);

describe('getEnclosingContext', () => {
  // Mock functions
  const mockEnclosingBlockName = enclosingBlockName as jest.MockedFunction<
    typeof enclosingBlockName
  >;
  const mockFindEnclosingBlocks = findEnclosingBlocks as jest.MockedFunction<
    typeof findEnclosingBlocks
  >;

  // Test data
  const mockDocument = makeTextDocument(['const value = 42;']);
  const ast = parseCode(mockDocument.getText())!;
  const lineOfSelectedVar = 0;

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
        className: 'MyClass',
        functionName: 'myMethod',
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
        className: 'MyClass',
        functionName: 'myMethod',
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

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });

    it('should handle only class name found', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'OuterClass',
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
        className: 'OuterClass',
        functionName: '',
      });
    });

    it('should handle only function name found', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: '',
        functionName: 'globalFunction',
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
        functionName: 'globalFunction',
      });
    });
  });

  describe('when only insertEnclosingClass is true', () => {
    it('should only call enclosingBlockName for class', () => {
      mockEnclosingBlockName.mockReturnValue('TestClass');

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
      expect(result).toEqual({
        className: 'TestClass',
        functionName: '',
      });
    });

    it('should return empty function name when not requested', () => {
      mockEnclosingBlockName.mockReturnValue('SomeClass');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        true,
        false,
      );

      expect(result.functionName).toBe('');
      expect(result.className).toBe('SomeClass');
    });
  });

  describe('when only insertEnclosingFunction is true', () => {
    it('should only call enclosingBlockName for function', () => {
      mockEnclosingBlockName.mockReturnValue('helperFunction');

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
      expect(result).toEqual({
        className: '',
        functionName: 'helperFunction',
      });
    });

    it('should return empty class name when not requested', () => {
      mockEnclosingBlockName.mockReturnValue('utilityFunction');

      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        true,
      );

      expect(result.className).toBe('');
      expect(result.functionName).toBe('utilityFunction');
    });
  });

  describe('when both insertEnclosingClass and insertEnclosingFunction are false', () => {
    it('should not call any functions', () => {
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

    it('should always return empty strings for both properties', () => {
      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        false,
      );

      expect(result.className).toBe('');
      expect(result.functionName).toBe('');
    });
  });

  describe('parameter passing', () => {
    it('should pass correct AST, document and line number to findEnclosingBlocks when both needed', () => {
      const customDocument = makeTextDocument([
        'function test() { const x = 1; }',
      ]);
      const customAst = parseCode(customDocument.getText())!;
      const customLine = 5;

      getEnclosingContext(customAst, customDocument, customLine, true, true);

      expect(mockFindEnclosingBlocks).toHaveBeenCalledWith(
        customAst,
        customDocument,
        customLine,
      );
    });

    it('should pass correct AST, document and line number to enclosingBlockName when only one needed', () => {
      const testCases = [0, 1, 10, 99];

      testCases.forEach((lineNumber) => {
        jest.clearAllMocks();
        getEnclosingContext(ast, mockDocument, lineNumber, true, false);

        expect(mockEnclosingBlockName).toHaveBeenCalledWith(
          ast,
          mockDocument,
          lineNumber,
          'class',
        );
      });
    });
  });

  describe('return value structure', () => {
    it('should always return an object with className and functionName properties', () => {
      const result = getEnclosingContext(
        ast,
        mockDocument,
        lineOfSelectedVar,
        false,
        false,
      );

      expect(result).toHaveProperty('className');
      expect(result).toHaveProperty('functionName');
      expect(typeof result.className).toBe('string');
      expect(typeof result.functionName).toBe('string');
    });

    it('should preserve exact return values from enclosingBlockName', () => {
      const specialValues = [
        '',
        'NormalName',
        'name_with_underscores',
        'CamelCase',
        '123Numbers',
      ];

      specialValues.forEach((value) => {
        jest.clearAllMocks();
        mockEnclosingBlockName.mockReturnValue(value);

        const result = getEnclosingContext(
          ast,
          mockDocument,
          lineOfSelectedVar,
          true,
          false,
        );

        expect(result.className).toBe(value);
      });
    });
  });

  describe('optimization behavior', () => {
    it('should use findEnclosingBlocks (single traversal) when both are needed', () => {
      mockFindEnclosingBlocks.mockReturnValue({
        className: 'MyClass',
        functionName: 'myMethod',
      });

      getEnclosingContext(ast, mockDocument, lineOfSelectedVar, true, true);

      // Verify it uses the optimized single-traversal function
      expect(mockFindEnclosingBlocks).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).not.toHaveBeenCalled();
    });

    it('should use enclosingBlockName (single lookup) when only one is needed', () => {
      mockEnclosingBlockName.mockReturnValue('TestClass');

      getEnclosingContext(ast, mockDocument, lineOfSelectedVar, true, false);

      // Verify it uses the single-block function
      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockFindEnclosingBlocks).not.toHaveBeenCalled();
    });

    it('should not traverse at all when neither is needed', () => {
      getEnclosingContext(ast, mockDocument, lineOfSelectedVar, false, false);

      // Verify no AST traversal happens
      expect(mockEnclosingBlockName).not.toHaveBeenCalled();
      expect(mockFindEnclosingBlocks).not.toHaveBeenCalled();
    });
  });
});
