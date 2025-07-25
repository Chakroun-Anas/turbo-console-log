import ts from 'typescript';
import cases from './index';
import { withinConditionBlockLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/withinConditionBlockLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('withinConditionBlockLine', () => {
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
        const result = withinConditionBlockLine(
          sourceFile,
          document,
          selectionLine,
          variableName,
        );
        expect(result).toBe(expectedLine);
      });
    },
  );
});
