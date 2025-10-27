import { arrayLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('arrayAssignmentLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = arrayLine(
        ast,
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
