import { logFunctionToUse } from '@/debug-message/js/JSDebugMessage/detectAll/helpers/logFunctionToUse';
import { LogType } from '@/entities/extension/extensionProperties';

describe('logFunctionToUse', () => {
  describe('main logic (without args)', () => {
    it('should return logType when logFunction is "log" and logType is not "log"', () => {
      expect(logFunctionToUse('log', LogType.warn)).toBe(LogType.warn);
      expect(logFunctionToUse('log', LogType.error)).toBe(LogType.error);
      expect(logFunctionToUse('log', LogType.debug)).toBe(LogType.debug);
    });

    it('should return logFunction when logFunction is "log" and logType is "log"', () => {
      expect(logFunctionToUse('log', LogType.log)).toBe('log');
    });

    it('should return logFunction when logFunction is not "log"', () => {
      expect(logFunctionToUse('console.error', LogType.warn)).toBe('console.error');
      expect(logFunctionToUse('myCustomLogger', LogType.error)).toBe('myCustomLogger');
    });
  });

  describe('args override', () => {
    it('should return logFunction from args when present', () => {
      const args = [{ logFunction: 'console.debug' }];
      expect(logFunctionToUse('log', LogType.warn, args)).toBe('console.debug');
    });

    it('should return logType from args when present and no logFunction', () => {
      const args = [{ logType: 'info' }];
      expect(logFunctionToUse('log', LogType.warn, args)).toBe('info');
    });

    it('should prioritize logFunction over logType in args', () => {
      const args = [{ logFunction: 'console.debug', logType: 'info' }];
      expect(logFunctionToUse('log', LogType.warn, args)).toBe('console.debug');
    });
  });

  describe('args fallback scenarios', () => {
    it('should fallback to main logic when args is invalid', () => {
      // Empty args
      expect(logFunctionToUse('log', LogType.warn, [])).toBe(LogType.warn);
      
      // Non-object first arg
      expect(logFunctionToUse('log', LogType.warn, ['string'])).toBe(LogType.warn);
      expect(logFunctionToUse('log', LogType.warn, [null])).toBe(LogType.warn);
      
      // Object without valid logFunction/logType
      expect(logFunctionToUse('log', LogType.warn, [{}])).toBe('log');
      expect(logFunctionToUse('log', LogType.warn, [{ logFunction: 123 }])).toBe('log');
      expect(logFunctionToUse('log', LogType.warn, [{ logType: 456 }])).toBe('log');
    });
  });
});
