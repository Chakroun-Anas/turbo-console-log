import { functionParameterLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('functionParameterLine – each layout style', () => {
  for (const test of testCases) {
    it(`should return correct insertion line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(doc.getText())!;
      const result = functionParameterLine(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expected);
    });
  }
});
