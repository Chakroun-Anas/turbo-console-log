import ts from 'typescript';
import { ternaryExpressionLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases';

describe('ternaryExpressionLine – various scenarios', () => {
  for (const test of testCases) {
    it(`returns correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        doc.fileName,
        doc.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const line = ternaryExpressionLine(
        sourceFile,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
