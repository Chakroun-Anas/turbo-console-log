import { wanderingExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/wanderingExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import cases from './cases';

describe('wanderingExpressionLine', () => {
  cases.forEach(
    ({ name, lines, selectionLine, variableName, expectedLine }) => {
      it(name, () => {
        const document = makeTextDocument(lines);
        const ast = parseCode(document.getText())!;
        const resultLine = wanderingExpressionLine(
          ast,
          document,
          selectionLine,
          variableName,
        );
        expect(resultLine).toBe(expectedLine);
      });
    },
  );
});
