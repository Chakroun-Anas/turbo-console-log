import ts from 'typescript';
import { functionParameterChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('functionParameterChecker', () => {
  for (const doc of passingCases) {
    it(`should detect function parameter – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = functionParameterChecker(
        sourceFile,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect function parameter – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = functionParameterChecker(
        sourceFile,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
