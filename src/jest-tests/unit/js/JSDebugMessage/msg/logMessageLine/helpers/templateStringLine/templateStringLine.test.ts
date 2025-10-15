import { templateStringLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('templateStringLine', () => {
  for (const testCase of testCases) {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (testCase as any).fileExtension)!;
      const result = templateStringLine(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(testCase.expectedLine);
    });
  }
});
