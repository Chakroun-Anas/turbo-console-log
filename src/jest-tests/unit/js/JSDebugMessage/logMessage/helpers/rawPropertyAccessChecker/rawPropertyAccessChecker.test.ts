import ts from 'typescript';
import { rawPropertyAccessChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/rawPropertyAccessChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('rawPropertyAccessChecker', () => {
  for (const test of passingCases) {
    it(`should detect property access – ${test.name}`, () => {
      const document = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = rawPropertyAccessChecker(
        sourceFile,
        document,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(true);
      expect(result?.metadata?.deepObjectPath).toBe(test.deepObjectPath);
    });
  }

  for (const test of failingCases) {
    it(`should not detect property access – ${test.name}`, () => {
      const document = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = rawPropertyAccessChecker(
        sourceFile,
        document,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
