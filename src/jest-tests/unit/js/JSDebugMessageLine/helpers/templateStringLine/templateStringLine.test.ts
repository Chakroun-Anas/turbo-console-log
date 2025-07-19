import { templateStringLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases/';

describe('templateStringLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = templateStringLine(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
