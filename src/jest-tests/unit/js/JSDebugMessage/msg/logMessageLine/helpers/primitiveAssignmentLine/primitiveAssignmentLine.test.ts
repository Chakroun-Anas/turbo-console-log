import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { primitiveAssignmentLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('primitiveAssignmentLine', () => {
  for (const test of testCases) {
    it(`should return correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(
        doc.getText(),
        test.fileExtension,
        test.selectionLine,
      );
      const line = primitiveAssignmentLine(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
