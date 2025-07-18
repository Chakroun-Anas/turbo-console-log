import { functionAssignmentLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/functionAssignmentLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import cases from './cases';

describe('functionAssignmentLine – insert after function assignments', () => {
  for (const doc of cases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionAssignmentLine(
        document,
        doc.selectionLine,
        doc.selectedVar,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
