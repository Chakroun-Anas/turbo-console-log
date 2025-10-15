import { ternaryExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('ternaryExpressionLine – various scenarios', () => {
  for (const test of testCases) {
    it(`returns correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (test as any).fileExtension)!;
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
