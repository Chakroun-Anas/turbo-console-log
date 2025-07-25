import ts from 'typescript';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { primitiveAssignmentLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import testCases from './cases';

describe('primitiveAssignmentLine', () => {
  for (const test of testCases) {
    it(`should return correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const sourceFile = ts.createSourceFile(
        doc.fileName,
        doc.getText(),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const line = primitiveAssignmentLine(
        sourceFile,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
