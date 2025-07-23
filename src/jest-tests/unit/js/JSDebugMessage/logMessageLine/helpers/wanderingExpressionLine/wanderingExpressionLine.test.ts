import { wanderingExpressionLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/wanderingExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import cases from './cases';

describe('wanderingExpressionLine', () => {
  cases.forEach(
    ({ name, lines, selectionLine, variableName, expectedLine }) => {
      it(name, () => {
        const document = makeTextDocument(lines);
        const resultLine = wanderingExpressionLine(
          document,
          selectionLine,
          variableName,
        );
        expect(resultLine).toBe(expectedLine);
      });
    },
  );
});
