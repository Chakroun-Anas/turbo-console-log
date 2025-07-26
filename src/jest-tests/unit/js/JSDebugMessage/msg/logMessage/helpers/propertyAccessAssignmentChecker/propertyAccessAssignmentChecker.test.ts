import ts from 'typescript';
import { propertyAccessAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/propertyAccessAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('propertyAccessAssignmentChecker', () => {
  for (const test of passingCases) {
    it(`should detect property access assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        doc.fileName,
        doc.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = propertyAccessAssignmentChecker(
        sourceFile,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should not detect property access assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        doc.fileName,
        doc.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = propertyAccessAssignmentChecker(
        sourceFile,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
