import { ternaryExpressionLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/ternaryExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases/';

describe('ternaryExpressionLine – various scenarios', () => {
  for (const test of testCases) {
    it(`returns correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const line = ternaryExpressionLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
