import { functionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/functionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('functionCallAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`✓ should detect function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as any).fileExtension,
        doc.selectionLine,
      )!;
      const result = functionCallAssignmentChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`✗ should not detect function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as any).fileExtension,
        doc.selectionLine,
      )!;
      const result = functionCallAssignmentChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
