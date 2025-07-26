import ts from 'typescript';
import { propertyMethodCallLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases';

describe('propertyMethodCallLine', () => {
  for (const test of testCases) {
    it(test.name, () => {
      const doc = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        doc.fileName,
        doc.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const line = propertyMethodCallLine(
        sourceFile,
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
