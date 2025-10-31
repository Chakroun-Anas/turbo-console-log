import { functionAssignmentLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import cases from './cases';

describe('functionAssignmentLine – insert after function assignments', () => {
  for (const doc of cases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = functionAssignmentLine(
        ast,
        document,
        doc.selectionLine,
        doc.selectedVar,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
