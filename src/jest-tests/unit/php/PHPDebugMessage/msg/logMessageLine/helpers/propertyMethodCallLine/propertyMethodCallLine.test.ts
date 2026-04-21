/**
 * Unit tests for PHP propertyMethodCallLine
 *
 * Tests the calculation of log insertion line for property method calls in chains:
 * - $user->getName()->toLowerCase()
 * - Multi-line chaining
 * - Laravel fluent interfaces
 */

import { propertyMethodCallLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/propertyMethodCallLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('propertyMethodCallLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const result = propertyMethodCallLine(
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
