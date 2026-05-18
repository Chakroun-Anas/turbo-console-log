/**
 * Unit tests for PHP binaryExpressionLine
 *
 * Tests the calculation of log insertion line for binary expressions:
 * - Arithmetic operations
 * - Logical operations
 * - Comparison operations
 * - String concatenation
 * - Multi-line expressions
 */

import { binaryExpressionLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/binaryExpressionLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('binaryExpressionLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = binaryExpressionLine(
          ast,
          doc,
          testCase.selectionLine,
          testCase.variableName,
        );

        expect(result).toBe(testCase.expectedLine);
      });
    }
  });
});
