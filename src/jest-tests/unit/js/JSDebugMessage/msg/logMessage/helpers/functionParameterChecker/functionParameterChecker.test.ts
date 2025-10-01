import { functionParameterChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('functionParameterChecker', () => {
  for (const doc of passingCases) {
    it(`should detect function parameter – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(document.getText())!;
      const result = functionParameterChecker(
        ast,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect function parameter – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(document.getText())!;
      const result = functionParameterChecker(
        ast,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
