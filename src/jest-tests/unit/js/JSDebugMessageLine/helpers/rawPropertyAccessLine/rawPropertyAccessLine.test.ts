import { rawPropertyAccessLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/rawPropertyAccessLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases/';

describe('rawPropertyAccessLine', () => {
  for (const test of testCases) {
    it(`should return correct insertion line – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = rawPropertyAccessLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
