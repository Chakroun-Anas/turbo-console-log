import { functionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/functionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('functionCallAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`✓ should detect function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`✗ should not detect function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
