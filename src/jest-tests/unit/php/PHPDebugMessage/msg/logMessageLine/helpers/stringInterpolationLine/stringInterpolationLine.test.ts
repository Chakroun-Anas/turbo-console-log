/**
 * Unit tests for PHP stringInterpolationLine
 *
 * Tests the calculation of log insertion line for string interpolation:
 * - Simple variable interpolation
 * - Property access interpolation
 * - Array element interpolation
 * - Multi-line interpolated strings
 */

import { stringInterpolationLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/stringInterpolationLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('stringInterpolationLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = stringInterpolationLine(
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
