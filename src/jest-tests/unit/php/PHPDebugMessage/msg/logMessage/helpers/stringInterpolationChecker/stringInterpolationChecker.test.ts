/**
 * Unit tests for PHP stringInterpolationChecker
 *
 * Tests the detection of string interpolation (variable embedding in strings):
 * - Simple variable: "Hello $name"
 * - Property access: "$user->name"
 * - Array elements: "$items[0]"
 * - Complex expressions: "{$price * $quantity}"
 */

import { stringInterpolationChecker } from '@/debug-message/php/PHPDebugMessage/msg/logMessage/helpers/stringInterpolationChecker';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('stringInterpolationChecker', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = stringInterpolationChecker(
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

        const result = stringInterpolationChecker(
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
