import ts from 'typescript';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { propertyAccessAssignmentLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import testCases from './cases';

describe('propertyAccessAssignmentLine – insert after property access assignment', () => {
  for (const test of testCases) {
    it(`should return correct insertion line – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        doc.fileName,
        doc.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = propertyAccessAssignmentLine(
        sourceFile,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
