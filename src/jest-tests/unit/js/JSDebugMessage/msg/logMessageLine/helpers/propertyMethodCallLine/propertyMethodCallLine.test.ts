import { propertyMethodCallLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('propertyMethodCallLine', () => {
  for (const testCase of testCases) {
    it(testCase.name, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(
        document.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = propertyMethodCallLine(
        ast,
        document,
        testCase.selectionLine,
        testCase.selectedText,
      );
      expect(result).toBe(testCase.expectedLine);
    });
  }
});
