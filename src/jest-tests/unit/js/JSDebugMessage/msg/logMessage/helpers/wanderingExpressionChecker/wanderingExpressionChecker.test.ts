import { wanderingExpressionChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/wanderingExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('wanderingExpressionChecker', () => {
  passingCases.forEach((testCase) => {
    it(`passes: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = wanderingExpressionChecker(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  });

  failingCases.forEach((testCase) => {
    it(`fails: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const ast = parseCode(
        doc.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );
      const result = wanderingExpressionChecker(
        ast,
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  });
});
