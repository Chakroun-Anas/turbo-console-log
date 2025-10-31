import { wanderingExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/wanderingExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import cases from './cases';

describe('wanderingExpressionLine', () => {
  cases.forEach((testCase) => {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const resultLine = wanderingExpressionLine(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(resultLine).toBe(testCase.expectedLine);
    });
  });
});
