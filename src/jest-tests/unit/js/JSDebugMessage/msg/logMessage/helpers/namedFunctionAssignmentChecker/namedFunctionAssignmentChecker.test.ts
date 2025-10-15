import { namedFunctionAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/namedFunctionAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('namedFunctionAssignmentChecker', () => {
  for (const test of passingCases) {
    it(`should detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (test as any).fileExtension)!;
      const result = namedFunctionAssignmentChecker(
        ast,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should not detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (test as any).fileExtension)!;
      const result = namedFunctionAssignmentChecker(
        ast,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
