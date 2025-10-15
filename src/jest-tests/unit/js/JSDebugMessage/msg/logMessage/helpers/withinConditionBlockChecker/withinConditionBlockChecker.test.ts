import cases from './index';
import { withinConditionBlockChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/withinConditionBlockChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';

describe('withinConditionBlockChecker', () => {
  cases.forEach(({ name, lines, selectionLine, variableName, expected }) => {
    it(name, () => {
      const document = makeTextDocument(lines);
      const ast = parseCode(document.getText())!;
      const result = withinConditionBlockChecker(
        ast,
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(expected);
    });
  });
});
