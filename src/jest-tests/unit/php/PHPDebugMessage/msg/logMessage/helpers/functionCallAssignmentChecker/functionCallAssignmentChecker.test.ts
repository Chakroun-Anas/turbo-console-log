/**
 * Unit tests for PHP functionCallAssignmentChecker
 *
 * Tests the detection of function/method call assignments in PHP:
 * - $result = getUser($id)
 * - $data = $obj->method()
 * - $value = ClassName::staticMethod()
 */

import { functionCallAssignmentChecker } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers/functionCallAssignmentChecker';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('functionCallAssignmentChecker', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = functionCallAssignmentChecker(
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

        const result = functionCallAssignmentChecker(
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
