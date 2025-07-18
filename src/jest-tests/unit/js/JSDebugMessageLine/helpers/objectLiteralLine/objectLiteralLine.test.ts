import { objectLiteralLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/objectLiteralLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases/';

describe('objectLiteralLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectLiteralLine(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
