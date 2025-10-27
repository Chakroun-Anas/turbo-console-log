import { propertyMethodCallChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/propertyMethodCallChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('propertyMethodCallChecker', () => {
  for (const test of passingCases) {
    it(`should detect property method call – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(
        doc.getText(),
        test.fileExtension,
        test.selectionLine,
      );
      const result = propertyMethodCallChecker(
        ast,
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should not detect property method call – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(
        doc.getText(),
        test.fileExtension,
        test.selectionLine,
      );
      const result = propertyMethodCallChecker(
        ast,
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
