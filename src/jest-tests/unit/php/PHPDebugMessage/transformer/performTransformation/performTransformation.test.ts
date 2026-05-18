import { performTransformation } from '@/debug-message/php/PHPDebugMessage/msg/transformer/performTransformation';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import testCases from './cases';

const options = {
  tabSize: 2,
};

describe('performTransformation (PHP)', () => {
  const phpParser = getPhpParser();
  for (const testCase of testCases) {
    it(`should transform code correctly – ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(doc.getText(), phpParser);
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
