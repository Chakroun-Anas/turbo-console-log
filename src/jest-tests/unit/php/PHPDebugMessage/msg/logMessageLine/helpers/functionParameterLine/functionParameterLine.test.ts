/**
 * Unit tests for PHP functionParameterLine
 *
 * Tests the calculation of log insertion line for function parameters in PHP:
 * - function getUser($userId) { ... }
 * - Multi-line parameter lists
 */

import { functionParameterLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/functionParameterLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('functionParameterLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = functionParameterLine(
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
