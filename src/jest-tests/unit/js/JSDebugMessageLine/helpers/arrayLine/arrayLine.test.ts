// arrayAssignmentLine.test.ts
import { arrayLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/arrayLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases';

describe('arrayAssignmentLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = arrayLine(document, doc.selectionLine, doc.variableName);
      expect(result).toBe(doc.expectedLine);
    });
  }
});
