import { performTransformation } from '@/debug-message/js/JSDebugMessage/msg/transformer/performTransformation';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

const options = {
  addSemicolonInTheEnd: true,
  tabSize: 2,
};

describe('performTransformation', () => {
  for (const testCase of testCases) {
    it(`should transform code correctly – ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.line,
      );
      const result = performTransformation(
        ast,
        doc,
        testCase.line,
        testCase.selectedVar,
        testCase.debuggingMsg,
        options,
      ).trim();
      const expected = Array.isArray(testCase.expected)
        ? testCase.expected.join('\n')
        : testCase.expected;
      expect(result).toBe(expected);
    });
  }
});
