import { objectLiteralChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/objectLiteralChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('objectLiteralChecker', () => {
  for (const doc of passingCases) {
    it(`should detect object literal – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = objectLiteralChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect object literal – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = objectLiteralChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
