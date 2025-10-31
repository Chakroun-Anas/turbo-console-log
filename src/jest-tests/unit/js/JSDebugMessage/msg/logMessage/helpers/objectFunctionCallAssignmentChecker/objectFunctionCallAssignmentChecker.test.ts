import { objectFunctionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/objectFunctionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('objectFunctionCallAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`should detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = objectFunctionCallAssignmentChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = objectFunctionCallAssignmentChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
