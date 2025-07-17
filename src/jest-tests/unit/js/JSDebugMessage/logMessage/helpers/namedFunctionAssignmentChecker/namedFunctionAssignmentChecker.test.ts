import { namedFunctionAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/namedFunctionAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('namedFunctionAssignmentChecker', () => {
  for (const test of passingCases) {
    it(`should detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = namedFunctionAssignmentChecker(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should NOT detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = namedFunctionAssignmentChecker(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
