import { addPrefix } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/addPrefix';

describe('PHP addPrefix', () => {
  it('should add prefix with delimiter when prefix is provided', () => {
    const result = addPrefix('🚀', ':');
    expect(result).toEqual(['🚀', ' : ']);
  });

  it('should return empty array when prefix is empty string', () => {
    const result = addPrefix('', ':');
    expect(result).toEqual([]);
  });

  it('should handle different delimiters', () => {
    const result = addPrefix('DEBUG', '>>');
    expect(result).toEqual(['DEBUG', ' >> ']);
  });

  it('should handle emoji prefix', () => {
    const result = addPrefix('🔥', '|');
    expect(result).toEqual(['🔥', ' | ']);
  });

  it('should handle multi-character prefix', () => {
    const result = addPrefix('[LOG]', '-');
    expect(result).toEqual(['[LOG]', ' - ']);
  });

  it('should add spaces around delimiter by default', () => {
    const result = addPrefix('PREFIX', ':');
    expect(result[1]).toBe(' : ');
  });
});
