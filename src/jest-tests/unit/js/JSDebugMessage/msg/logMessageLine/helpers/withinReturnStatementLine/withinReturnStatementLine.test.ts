import { withinReturnStatementLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/withinReturnStatementLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('withinReturnStatementLine', () => {
  testCases.forEach((testCase) => {
    it(testCase.name, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText())!;
      const result = withinReturnStatementLine(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(testCase.expected);
    });
  });
});
