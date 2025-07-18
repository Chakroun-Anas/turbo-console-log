import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { propertyAccessAssignmentLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/propertyAccessAssignmentLine';
import testCases from './cases/';

describe('propertyAccessAssignmentLine – insert after property access assignment', () => {
  for (const test of testCases) {
    it(`should return correct insertion line – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = propertyAccessAssignmentLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
