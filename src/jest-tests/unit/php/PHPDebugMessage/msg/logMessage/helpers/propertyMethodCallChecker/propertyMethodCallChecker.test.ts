import { propertyMethodCallChecker } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers/propertyMethodCallChecker';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('propertyMethodCallChecker', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = propertyMethodCallChecker(
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

        const result = propertyMethodCallChecker(
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
