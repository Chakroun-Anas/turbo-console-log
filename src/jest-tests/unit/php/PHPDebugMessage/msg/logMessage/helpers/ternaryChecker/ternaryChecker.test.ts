import { ternaryChecker } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers/ternaryChecker';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('ternaryChecker', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = ternaryChecker(
          ast,
          doc,
          testCase.selectionLine,
          testCase.variableName,
        );

        expect(result.isChecked).toBe(true);
      });
    }
  });

  describe('failing cases', () => {
    for (const testCase of failingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = ternaryChecker(
          ast,
          doc,
          testCase.selectionLine,
          testCase.variableName,
        );

        expect(result.isChecked).toBe(false);
      });
    }
  });
});
