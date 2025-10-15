import { needTransformation } from '@/debug-message/js/JSDebugMessage/msg/transformer/needTransformation';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('needTransformation', () => {
  for (const testCase of passingCases) {
    it(`should require transformation – ${testCase.name}`, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText())!;
      const result = needTransformation(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(true);
    });
  }

  for (const testCase of failingCases) {
    it(`should NOT require transformation – ${testCase.name}`, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText())!;
      const result = needTransformation(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result).toBe(false);
    });
  }
});
