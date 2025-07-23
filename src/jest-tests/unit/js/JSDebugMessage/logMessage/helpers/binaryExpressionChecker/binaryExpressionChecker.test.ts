import { binaryExpressionChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/binaryExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('binaryExpressionChecker', () => {
  for (const doc of passingCases) {
    it(`should detect binary expression assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = binaryExpressionChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect binary expression assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = binaryExpressionChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
