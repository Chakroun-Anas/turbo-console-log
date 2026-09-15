import { rawPropertyAccessLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('rawPropertyAccessLine', () => {
  for (const testCase of testCases) {
    // `knownBroken` cases pin behaviour the engine does not honour yet.
    const runner = testCase.knownBroken ? it.failing : it;

    runner(testCase.name, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(
        document.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = rawPropertyAccessLine(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(testCase.expectedLine);
    });
  }
});
