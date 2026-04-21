import { ternaryLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/ternaryLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('ternaryLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(`should return correct line for: ${testCase.name}`, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const line = ternaryLine(
          ast,
          doc,
          testCase.selectionLine,
          testCase.variableName,
        );

        expect(line).toBe(testCase.expectedLine);
      });
    }
  });
});
