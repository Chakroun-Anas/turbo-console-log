/**
 * Unit tests for PHP propertyAccessAssignmentLine
 *
 * Tests the calculation of log insertion line for property access assignments in PHP:
 * - $name = $user->name
 * - $city = $user->address->city
 * - Multi-line chained property access
 */

import { propertyAccessAssignmentLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/propertyAccessAssignmentLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('propertyAccessAssignmentLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = propertyAccessAssignmentLine(
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
