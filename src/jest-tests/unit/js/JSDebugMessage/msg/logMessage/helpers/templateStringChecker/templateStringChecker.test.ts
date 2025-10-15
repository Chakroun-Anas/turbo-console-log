import { templateStringChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/templateStringChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('templateStringChecker', () => {
  for (const doc of passingCases) {
    it(`should detect template string – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(document.getText())!;
      const result = templateStringChecker(
        ast,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect template string – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(document.getText())!;
      const result = templateStringChecker(
        ast,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
