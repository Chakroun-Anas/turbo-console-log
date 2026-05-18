import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { primitiveAssignmentLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/primitiveAssignmentLine';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import testCases from './cases';

describe('primitiveAssignmentLine', () => {
  const phpParser = getPhpParser();
  for (const test of testCases) {
    it(`should return correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(doc.getText(), phpParser);
      const line = primitiveAssignmentLine(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
