import { needTransformation } from '@/debug-message/php/PHPDebugMessage/msg/transformer/needTransformation';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('needTransformation (PHP)', () => {
  const phpParser = getPhpParser();
  for (const testCase of passingCases) {
    it(`should require transformation – ${testCase.name}`, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText(), phpParser);
      const result = needTransformation(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(true);
    });
  }

  for (const testCase of failingCases) {
    it(`should NOT require transformation – ${testCase.name}`, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText(), phpParser);
      const result = needTransformation(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(false);
    });
  }
});
