import { templateStringLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('templateStringLine', () => {
  for (const testCase of testCases) {
    it(testCase.name, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText())!;
      const result = templateStringLine(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(testCase.expectedLine);
    });
  }
});
