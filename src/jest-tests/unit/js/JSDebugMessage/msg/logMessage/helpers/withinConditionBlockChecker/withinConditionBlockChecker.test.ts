import cases from './index';
import { withinConditionBlockChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/withinConditionBlockChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';

describe('withinConditionBlockChecker', () => {
  cases.forEach((testCase) => {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = withinConditionBlockChecker(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(testCase.expected);
    });
  });
});
