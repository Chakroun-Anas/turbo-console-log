import { wanderingExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/wanderingExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import cases from './cases';

describe('wanderingExpressionLine', () => {
  cases.forEach((testCase) => {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (testCase as any).fileExtension)!;
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
