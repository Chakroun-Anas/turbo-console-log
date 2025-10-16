import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('parseCode', () => {
  describe('successful parsing cases', () => {
    for (const testCase of passingCases) {
      it(`should successfully parse ${testCase.name}`, () => {
        const sourceCodeString = Array.isArray(testCase.sourceCode)
          ? testCase.sourceCode.join('\n')
          : testCase.sourceCode;
        const result = parseCode(
          sourceCodeString,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (testCase as any).fileExtension || undefined,
        );

        // Check that the result is a valid AST node
        expect(result).toBeDefined();
        expect(result.type).toBe('Program');

        // Check that locations are included
        expect(result.start).toBeDefined();
        expect(result.end).toBeDefined();
        expect(typeof result.start).toBe('number');
        expect(typeof result.end).toBe('number');
      });
    }
  });

  describe('parsing error cases', () => {
    for (const testCase of failingCases) {
      it(`should throw error for ${testCase.name}`, () => {
        expect(() => {
          const sourceCodeString = Array.isArray(testCase.sourceCode)
            ? testCase.sourceCode.join('\n')
            : testCase.sourceCode;
          parseCode(
            sourceCodeString,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (testCase as any).fileExtension || undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (testCase as any).selectionLine,
          );
        }).toThrow(testCase.expectedError);
      });
    }
  });
});
