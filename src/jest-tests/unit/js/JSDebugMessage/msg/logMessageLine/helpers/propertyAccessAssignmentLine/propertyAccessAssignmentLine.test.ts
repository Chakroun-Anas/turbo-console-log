import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { propertyAccessAssignmentLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import testCases from './cases';

describe('propertyAccessAssignmentLine – insert after property access assignment', () => {
  for (const test of testCases) {
    it(`should return correct insertion line – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (doc as any).fileExtension)!;
      const result = propertyAccessAssignmentLine(
        ast,
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
