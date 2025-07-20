import cases from './index';
import { withinConditionBlockChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/withinConditionBlockChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('withinConditionBlockChecker', () => {
  cases.forEach(({ name, lines, selectionLine, variableName, expected }) => {
    it(name, () => {
      const document = makeTextDocument(lines);
      const result = withinConditionBlockChecker(
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(expected);
    });
  });
});
