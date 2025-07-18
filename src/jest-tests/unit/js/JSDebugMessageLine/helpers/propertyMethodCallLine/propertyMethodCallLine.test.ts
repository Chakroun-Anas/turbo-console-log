import { propertyMethodCallLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/propertyMethodCallLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases/';

describe('propertyMethodCallLine', () => {
  for (const test of testCases) {
    it(test.name, () => {
      const doc = makeTextDocument(test.lines);
      const line = propertyMethodCallLine(
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
