import { propertyAccessAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/propertyAccessAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('propertyAccessAssignmentChecker', () => {
  for (const test of passingCases) {
    it(`should detect property access assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(doc.getText())!;
      const result = propertyAccessAssignmentChecker(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should not detect property access assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(doc.getText());
      const result = propertyAccessAssignmentChecker(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
