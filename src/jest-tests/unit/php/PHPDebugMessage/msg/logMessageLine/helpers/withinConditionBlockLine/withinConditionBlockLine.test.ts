import { withinConditionBlockLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/withinConditionBlockLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import cases from './cases';

describe('withinConditionBlockLine', () => {
  const phpParser = getPhpParser();
  for (const testCase of cases) {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(doc.getText(), phpParser);

      const result = withinConditionBlockLine(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );

      expect(result).toBe(testCase.expectedLine);
    });
  }
});
