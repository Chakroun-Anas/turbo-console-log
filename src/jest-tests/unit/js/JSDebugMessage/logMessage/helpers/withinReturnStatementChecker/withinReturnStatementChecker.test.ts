import { withinReturnStatementChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/withinReturnStatementChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('withinReturnStatementChecker', () => {
  for (const testCase of passingCases) {
    it(`should detect: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const result = withinReturnStatementChecker(
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const testCase of failingCases) {
    it(`should reject: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const result = withinReturnStatementChecker(
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
