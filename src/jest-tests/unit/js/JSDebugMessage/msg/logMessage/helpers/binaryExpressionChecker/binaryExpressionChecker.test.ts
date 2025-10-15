import { binaryExpressionChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/binaryExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('binaryExpressionChecker', () => {
  for (const doc of passingCases) {
    it(`should detect binary expression assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(document.getText(), (doc as any).fileExtension)!;
      const result = binaryExpressionChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect binary expression assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(document.getText(), (doc as any).fileExtension)!;
      const result = binaryExpressionChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
