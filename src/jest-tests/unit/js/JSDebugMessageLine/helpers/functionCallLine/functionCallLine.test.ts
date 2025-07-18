import { functionCallLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/functionCallLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import testCases from './cases';

describe('functionCallLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionCallLine(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
