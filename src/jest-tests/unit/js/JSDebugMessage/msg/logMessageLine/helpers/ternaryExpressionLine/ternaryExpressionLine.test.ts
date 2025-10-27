import { ternaryExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('ternaryExpressionLine – various scenarios', () => {
  for (const test of testCases) {
    it(`returns correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(
        doc.getText(),
        test.fileExtension,
        test.selectionLine,
      );
      const line = ternaryExpressionLine(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
