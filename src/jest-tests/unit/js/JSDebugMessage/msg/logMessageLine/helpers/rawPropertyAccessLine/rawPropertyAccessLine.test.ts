import { rawPropertyAccessLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('rawPropertyAccessLine', () => {
  for (const testCase of testCases) {
    it(testCase.name, () => {
      const document = makeTextDocument(testCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(document.getText(), (document as any).fileExtension)!;
      const result = rawPropertyAccessLine(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(testCase.expectedLine);
    });
  }
});
