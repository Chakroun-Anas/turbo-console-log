import { withinReturnStatementLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/withinReturnStatementLine';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import passingCases from './passingCases';

describe('withinReturnStatementLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(`should return correct line for: ${testCase.name}`, () => {
        const doc = makeTextDocument(testCase.lines);
        const ast = parseCode(doc.getText(), phpParser);

        const line = withinReturnStatementLine(
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
