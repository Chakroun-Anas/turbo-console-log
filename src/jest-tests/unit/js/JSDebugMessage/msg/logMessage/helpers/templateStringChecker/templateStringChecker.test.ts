import { templateStringChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/templateStringChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('templateStringChecker', () => {
  for (const passingCase of passingCases) {
    it(`should detect template string – ${passingCase.name}`, () => {
      const doc = makeTextDocument(passingCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (passingCase as any).fileExtension)!;
      const result = templateStringChecker(
        ast,
        doc,
        passingCase.selectionLine,
        passingCase.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const passingCase of failingCases) {
    it(`should not detect template string – ${passingCase.name}`, () => {
      const doc = makeTextDocument(passingCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (passingCase as any).fileExtension)!;
      const result = templateStringChecker(
        ast,
        doc,
        passingCase.selectionLine,
        passingCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
