import ts from 'typescript';
import { objectFunctionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/objectFunctionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('objectFunctionCallAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`should detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = objectFunctionCallAssignmentChecker(
        sourceFile,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = objectFunctionCallAssignmentChecker(
        sourceFile,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
