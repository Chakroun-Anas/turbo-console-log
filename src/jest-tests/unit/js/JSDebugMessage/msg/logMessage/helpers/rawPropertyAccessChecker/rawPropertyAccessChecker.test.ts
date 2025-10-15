import { rawPropertyAccessChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/rawPropertyAccessChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('rawPropertyAccessChecker', () => {
  for (const test of passingCases) {
    it(`should detect property access – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (test as any).fileExtension)!;
      const result = rawPropertyAccessChecker(
        ast,
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(true);
      expect(result?.metadata?.deepObjectPath).toBe(test.deepObjectPath);
    });
  }

  for (const test of failingCases) {
    it(`should not detect property access – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (test as any).fileExtension)!;
      const result = rawPropertyAccessChecker(
        ast,
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
