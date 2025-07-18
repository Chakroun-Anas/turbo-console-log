import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { primitiveAssignmentLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/primitiveAssignmentLine';
import testCases from './cases/';

describe('primitiveAssignmentLine', () => {
  for (const test of testCases) {
    it(`should return correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const line = primitiveAssignmentLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
