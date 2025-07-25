import ts from 'typescript';
import { rawPropertyAccessLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases';

describe('rawPropertyAccessLine', () => {
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
      const result = rawPropertyAccessLine(
        sourceFile,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
