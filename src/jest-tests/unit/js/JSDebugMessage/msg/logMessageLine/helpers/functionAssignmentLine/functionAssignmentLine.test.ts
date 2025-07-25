import ts from 'typescript';
import { functionAssignmentLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import cases from './cases';

describe('functionAssignmentLine – insert after function assignments', () => {
  for (const doc of cases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const sourceFile = ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const result = functionAssignmentLine(
        sourceFile,
        document,
        doc.selectionLine,
        doc.selectedVar,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
