import { ternaryChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/ternaryChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('ternaryChecker', () => {
  for (const passingCase of passingCases) {
    it(`should detect ternary – ${passingCase.name}`, () => {
      const doc = makeTextDocument(passingCase.lines);
      const ast = parseCode(
        doc.getText(),
        passingCase.fileExtension,
        passingCase.selectionLine,
      );
      const result = ternaryChecker(
        ast,
        doc,
        passingCase.selectionLine,
        passingCase.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const passingCase of failingCases) {
    it(`should not detect ternary – ${passingCase.name}`, () => {
      const doc = makeTextDocument(passingCase.lines);
      const ast = parseCode(
        doc.getText(),
        passingCase.fileExtension,
        passingCase.selectionLine,
      );
      const result = ternaryChecker(
        ast,
        doc,
        passingCase.selectionLine,
        passingCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
