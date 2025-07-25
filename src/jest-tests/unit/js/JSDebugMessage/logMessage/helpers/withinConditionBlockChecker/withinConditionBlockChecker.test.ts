import ts from 'typescript';
import cases from './index';
import { withinConditionBlockChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/withinConditionBlockChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('withinConditionBlockChecker', () => {
  cases.forEach(({ name, lines, selectionLine, variableName, expected }) => {
    it(name, () => {
      const document = makeTextDocument(lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = withinConditionBlockChecker(
        sourceFile,
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(expected);
    });
  });
});
