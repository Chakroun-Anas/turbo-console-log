import { arrayAssignmentChecker } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers/arrayAssignmentChecker';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('arrayAssignmentChecker', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(`should detect array assignment – ${testCase.name}`, () => {
        const document = makeTextDocument(testCase.lines);
        const ast = parseCode(document.getText(), phpParser);
        const result = arrayAssignmentChecker(
          ast,
          document,
          testCase.selectionLine,
          testCase.variableName,
        );
        expect(result.isChecked).toBe(true);
      });
    }
  });

  describe('failing cases', () => {
    for (const testCase of failingCases) {
      it(`should not detect array assignment – ${testCase.name}`, () => {
        const document = makeTextDocument(testCase.lines);
        const ast = parseCode(document.getText(), phpParser);
        const result = arrayAssignmentChecker(
          ast,
          document,
          testCase.selectionLine,
          testCase.variableName,
        );
        expect(result.isChecked).toBe(false);
      });
    }
  });
});
