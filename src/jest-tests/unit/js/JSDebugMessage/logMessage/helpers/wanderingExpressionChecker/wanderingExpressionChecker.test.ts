import ts from 'typescript';
import { wanderingExpressionChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/wanderingExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('wanderingExpressionChecker', () => {
  passingCases.forEach(({ name, lines, selectionLine, variableName }) => {
    it(`passes: ${name}`, () => {
      const document = makeTextDocument(lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = wanderingExpressionChecker(
        sourceFile,
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  });

  failingCases.forEach(({ name, lines, selectionLine, variableName }) => {
    it(`fails: ${name}`, () => {
      const document = makeTextDocument(lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = wanderingExpressionChecker(
        sourceFile,
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  });
});
