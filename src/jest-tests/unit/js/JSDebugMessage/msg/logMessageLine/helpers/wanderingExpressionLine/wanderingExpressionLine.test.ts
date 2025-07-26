import ts from 'typescript';
import { wanderingExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/wanderingExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import cases from './cases';

describe('wanderingExpressionLine', () => {
  cases.forEach(
    ({ name, lines, selectionLine, variableName, expectedLine }) => {
      it(name, () => {
        const document = makeTextDocument(lines);
        const sourceFile = ts.createSourceFile(
          document.fileName,
          document.getText(),
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TS,
        );
        const resultLine = wanderingExpressionLine(
          sourceFile,
          document,
          selectionLine,
          variableName,
        );
        expect(resultLine).toBe(expectedLine);
      });
    },
  );
});
