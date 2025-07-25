import ts from 'typescript';
import { ternaryChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/ternaryChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('ternaryChecker', () => {
  for (const doc of passingCases) {
    it(`should detect ternary – ${doc.name}`, () => {
      const textDocument = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        textDocument.fileName,
        textDocument.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = ternaryChecker(
        sourceFile,
        textDocument,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect ternary – ${doc.name}`, () => {
      const textDocument = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        textDocument.fileName,
        textDocument.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = ternaryChecker(
        sourceFile,
        textDocument,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
