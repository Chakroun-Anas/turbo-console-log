import { primitiveAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/primitiveAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('primitiveAssignmentChecker', () => {
  for (const testCase of passingCases) {
    it(`should detect: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const result = primitiveAssignmentChecker(
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
      const result = primitiveAssignmentChecker(
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
