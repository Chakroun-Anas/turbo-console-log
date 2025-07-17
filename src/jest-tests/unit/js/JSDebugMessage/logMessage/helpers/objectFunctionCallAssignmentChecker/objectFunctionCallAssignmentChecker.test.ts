import { objectFunctionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/objectFunctionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('objectFunctionCallAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`should detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectFunctionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectFunctionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
