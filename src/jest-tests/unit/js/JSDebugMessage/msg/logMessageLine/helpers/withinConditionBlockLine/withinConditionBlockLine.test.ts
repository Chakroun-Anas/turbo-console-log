import { withinConditionBlockLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/withinConditionBlockLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import cases from './index';

describe('withinConditionBlockLine', () => {
  cases.forEach(
    ({
      name,
      lines,
      selectionLine,
      variableName,
      expectedLine,
      fileExtension,
    }) => {
      it(name, () => {
        const document = makeTextDocument(lines);
        const ast = parseCode(
          document.getText(),
          fileExtension,
          selectionLine,
        )!;
        const result = withinConditionBlockLine(
          ast,
          document,
          selectionLine,
          variableName,
        );
        expect(result).toBe(expectedLine);
      });
    },
  );
});
