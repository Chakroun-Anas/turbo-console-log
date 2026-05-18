/**
 * Unit tests for PHP functionCallAssignmentLine
 *
 * Tests the calculation of log insertion line for function/method call assignments in PHP:
 * - $result = getUser($id)
 * - $data = $obj->method()
 * - Multi-line function calls
 */

import { functionCallAssignmentLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/functionCallAssignmentLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('functionCallAssignmentLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = functionCallAssignmentLine(
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
