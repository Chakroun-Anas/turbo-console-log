import { getEnclosingContext } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/getEnclosingContext';
import { enclosingBlockName } from '@/debug-message/js/JSDebugMessage/enclosingBlockName';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

// Mock the enclosingBlockName dependency
jest.mock('@/debug-message/js/JSDebugMessage/enclosingBlockName');

describe('getEnclosingContext', () => {
  // Mock function
  const mockEnclosingBlockName = enclosingBlockName as jest.MockedFunction<typeof enclosingBlockName>;

  // Test data
  const mockDocument = makeTextDocument(['const value = 42;']);
  const lineOfSelectedVar = 0;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock return values
    mockEnclosingBlockName.mockReturnValue('');
  });

  describe('when both insertEnclosingClass and insertEnclosingFunction are true', () => {
    it('should call enclosingBlockName for both class and function', () => {
      mockEnclosingBlockName
        .mockReturnValueOnce('MyClass')
        .mockReturnValueOnce('myMethod');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        true,
        true
      );

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(2);
      expect(mockEnclosingBlockName).toHaveBeenNthCalledWith(
        1,
        mockDocument,
        lineOfSelectedVar,
        'class'
      );
      expect(mockEnclosingBlockName).toHaveBeenNthCalledWith(
        2,
        mockDocument,
        lineOfSelectedVar,
        'function'
      );
      expect(result).toEqual({
        className: 'MyClass',
        functionName: 'myMethod'
      });
    });

    it('should handle empty class and function names', () => {
      mockEnclosingBlockName.mockReturnValue('');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        true,
        true
      );

      expect(result).toEqual({
        className: '',
        functionName: ''
      });
    });

    it('should handle only class name found', () => {
      mockEnclosingBlockName
        .mockReturnValueOnce('OuterClass')
        .mockReturnValueOnce('');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        true,
        true
      );

      expect(result).toEqual({
        className: 'OuterClass',
        functionName: ''
      });
    });

    it('should handle only function name found', () => {
      mockEnclosingBlockName
        .mockReturnValueOnce('')
        .mockReturnValueOnce('globalFunction');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        true,
        true
      );

      expect(result).toEqual({
        className: '',
        functionName: 'globalFunction'
      });
    });
  });

  describe('when only insertEnclosingClass is true', () => {
    it('should only call enclosingBlockName for class', () => {
      mockEnclosingBlockName.mockReturnValue('TestClass');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        true,
        false
      );

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        mockDocument,
        lineOfSelectedVar,
        'class'
      );
      expect(result).toEqual({
        className: 'TestClass',
        functionName: ''
      });
    });

    it('should return empty function name when not requested', () => {
      mockEnclosingBlockName.mockReturnValue('SomeClass');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        true,
        false
      );

      expect(result.functionName).toBe('');
      expect(result.className).toBe('SomeClass');
    });
  });

  describe('when only insertEnclosingFunction is true', () => {
    it('should only call enclosingBlockName for function', () => {
      mockEnclosingBlockName.mockReturnValue('helperFunction');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        false,
        true
      );

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        mockDocument,
        lineOfSelectedVar,
        'function'
      );
      expect(result).toEqual({
        className: '',
        functionName: 'helperFunction'
      });
    });

    it('should return empty class name when not requested', () => {
      mockEnclosingBlockName.mockReturnValue('utilityFunction');

      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        false,
        true
      );

      expect(result.className).toBe('');
      expect(result.functionName).toBe('utilityFunction');
    });
  });

  describe('when both insertEnclosingClass and insertEnclosingFunction are false', () => {
    it('should not call enclosingBlockName at all', () => {
      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        false,
        false
      );

      expect(mockEnclosingBlockName).not.toHaveBeenCalled();
      expect(result).toEqual({
        className: '',
        functionName: ''
      });
    });

    it('should always return empty strings for both properties', () => {
      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        false,
        false
      );

      expect(result.className).toBe('');
      expect(result.functionName).toBe('');
    });
  });

  describe('parameter passing', () => {
    it('should pass correct document and line number to enclosingBlockName', () => {
      const customDocument = makeTextDocument(['function test() { const x = 1; }']);
      const customLine = 5;

      getEnclosingContext(customDocument, customLine, true, true);

      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        customDocument,
        customLine,
        'class'
      );
      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        customDocument,
        customLine,
        'function'
      );
    });

    it('should handle different line numbers correctly', () => {
      const testCases = [0, 1, 10, 99];

      testCases.forEach(lineNumber => {
        jest.clearAllMocks();
        getEnclosingContext(mockDocument, lineNumber, true, false);

        expect(mockEnclosingBlockName).toHaveBeenCalledWith(
          mockDocument,
          lineNumber,
          'class'
        );
      });
    });
  });

  describe('return value structure', () => {
    it('should always return an object with className and functionName properties', () => {
      const result = getEnclosingContext(
        mockDocument,
        lineOfSelectedVar,
        false,
        false
      );

      expect(result).toHaveProperty('className');
      expect(result).toHaveProperty('functionName');
      expect(typeof result.className).toBe('string');
      expect(typeof result.functionName).toBe('string');
    });

    it('should preserve exact return values from enclosingBlockName', () => {
      const specialValues = ['', 'NormalName', 'name_with_underscores', 'CamelCase', '123Numbers'];

      specialValues.forEach(value => {
        jest.clearAllMocks();
        mockEnclosingBlockName.mockReturnValue(value);

        const result = getEnclosingContext(
          mockDocument,
          lineOfSelectedVar,
          true,
          false
        );

        expect(result.className).toBe(value);
      });
    });
  });

  describe('call order', () => {
    it('should call class detection before function detection', () => {
      mockEnclosingBlockName
        .mockReturnValueOnce('ClassFirst')
        .mockReturnValueOnce('FunctionSecond');

      getEnclosingContext(mockDocument, lineOfSelectedVar, true, true);

      expect(mockEnclosingBlockName).toHaveBeenNthCalledWith(
        1,
        mockDocument,
        lineOfSelectedVar,
        'class'
      );
      expect(mockEnclosingBlockName).toHaveBeenNthCalledWith(
        2,
        mockDocument,
        lineOfSelectedVar,
        'function'
      );
    });

    it('should maintain call order even when class returns empty', () => {
      mockEnclosingBlockName
        .mockReturnValueOnce('')
        .mockReturnValueOnce('SomeFunction');

      getEnclosingContext(mockDocument, lineOfSelectedVar, true, true);

      const firstCall = mockEnclosingBlockName.mock.calls[0];
      const secondCall = mockEnclosingBlockName.mock.calls[1];

      expect(firstCall[2]).toBe('class');
      expect(secondCall[2]).toBe('function');
    });
  });
});
