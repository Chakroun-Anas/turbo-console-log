import { propertyMethodCallChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/propertyMethodCallChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('propertyMethodCallChecker', () => {
  for (const test of passingCases) {
    it(`should detect property method call – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = propertyMethodCallChecker(
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
      const result = propertyMethodCallChecker(
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
