import { withinReturnStatementLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/withinReturnStatementLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('withinReturnStatementLine', () => {
  testCases.forEach((testCase) => {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = withinReturnStatementLine(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(testCase.expected);
    });
  });
});
