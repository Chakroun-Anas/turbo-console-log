import cases from './index';
import { withinConditionBlockChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/withinConditionBlockChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';

describe('withinConditionBlockChecker', () => {
  cases.forEach((testCase) => {
    it(testCase.name, () => {
      const doc = makeTextDocument(testCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (testCase as any).fileExtension)!;
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
