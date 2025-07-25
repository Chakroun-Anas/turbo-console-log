import ts from 'typescript';
import { templateStringChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/templateStringChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('templateStringChecker', () => {
  for (const doc of passingCases) {
    it(`should detect template string – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = templateStringChecker(
        sourceFile,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect template string – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = templateStringChecker(
        sourceFile,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
