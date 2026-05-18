import { arrayAssignmentLine } from '@/debug-message/php/PHPDebugMessage/msg/logMessageLine/helpers/arrayAssignmentLine';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils/parseCode';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';
import {
  passingCase1,
  passingCase2,
  passingCase3,
  passingCase4,
  passingCase5,
  passingCase6,
  passingCase7,
  passingCase8,
  passingCase9,
  passingCase10,
} from './passingCases';

describe('arrayAssignmentLine', () => {
  const phpParser = getPhpParser();
  describe('passing cases', () => {
    const passingCases = [
      passingCase1,
      passingCase2,
      passingCase3,
      passingCase4,
      passingCase5,
      passingCase6,
      passingCase7,
      passingCase8,
      passingCase9,
      passingCase10,
    ];

    passingCases.forEach((testCase) => {
      it(testCase.name, () => {
        const document = makeTextDocument(testCase.lines);
        const sourceCode = testCase.lines.join('\n');
        const ast = parseCode(sourceCode, phpParser);

        const result = arrayAssignmentLine(
          ast,
          document,
          testCase.selectionLine,
          testCase.variableName,
        );

        expect(result).toBe(testCase.expectedLine);
      });
    });
  });
});
