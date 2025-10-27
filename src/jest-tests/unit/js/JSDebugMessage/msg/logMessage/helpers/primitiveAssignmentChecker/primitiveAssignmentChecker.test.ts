import { primitiveAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/primitiveAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('primitiveAssignmentChecker', () => {
  for (const testCase of passingCases) {
    it(`should detect: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = primitiveAssignmentChecker(
        ast,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const testCase of failingCases) {
    it(`should reject: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = primitiveAssignmentChecker(
        ast,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
