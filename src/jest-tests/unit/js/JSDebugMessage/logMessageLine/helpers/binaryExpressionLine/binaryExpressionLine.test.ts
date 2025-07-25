import ts from 'typescript';
import { binaryExpressionLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import documents from './cases';

describe('binaryExpressionLine – insertion line after binary expression', () => {
  for (const documnet of documents) {
    const doc = makeTextDocument(documnet.lines);
    const sourceFile = ts.createSourceFile(
      doc.fileName,
      doc.getText(),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const insertionLine = binaryExpressionLine(
      sourceFile,
      doc,
      documnet.selectionLine,
      documnet.variableName,
    );

    it(`returns correct insertion line – ${documnet.name}`, () => {
      expect(insertionLine).toBe(documnet.expectedLine);
    });
  }
});
