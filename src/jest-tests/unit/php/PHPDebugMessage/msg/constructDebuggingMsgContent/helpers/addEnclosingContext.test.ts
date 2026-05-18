import { addEnclosingContext } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/addEnclosingContext';

describe('PHP addEnclosingContext', () => {
  it('should add both class and function names', () => {
    const result = addEnclosingContext('UserService', 'create', ':');
    expect(result).toEqual(['UserService', ' : ', 'create', ' : ']);
  });

  it('should add only class name when function is empty', () => {
    const result = addEnclosingContext('Product', '', ':');
    expect(result).toEqual(['Product', ' : ']);
  });

  it('should add only function name when class is empty', () => {
    const result = addEnclosingContext('', 'processData', ':');
    expect(result).toEqual(['processData', ' : ']);
  });

  it('should return empty array when both are empty', () => {
    const result = addEnclosingContext('', '', ':');
    expect(result).toEqual([]);
  });

  it('should handle PHP constructor name', () => {
    const result = addEnclosingContext('Model', '__construct', '::');
    expect(result).toEqual(['Model', ' :: ', '__construct', ' :: ']);
  });

  it('should handle different delimiters', () => {
    const result = addEnclosingContext('Logger', 'log', '->');
    expect(result).toEqual(['Logger', ' -> ', 'log', ' -> ']);
  });

  it('should handle long class and method names', () => {
    const result = addEnclosingContext(
      'VeryLongClassNameHere',
      'veryLongMethodNameHere',
      ':',
    );
    expect(result).toEqual([
      'VeryLongClassNameHere',
      ' : ',
      'veryLongMethodNameHere',
      ' : ',
    ]);
  });

  it('should preserve order (class before function)', () => {
    const result = addEnclosingContext('MyClass', 'myMethod', '|');
    expect(result[0]).toBe('MyClass');
    expect(result[2]).toBe('myMethod');
  });
});
