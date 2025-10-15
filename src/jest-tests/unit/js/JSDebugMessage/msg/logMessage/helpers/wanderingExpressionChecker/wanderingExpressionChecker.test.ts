import { wanderingExpressionChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/wanderingExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('wanderingExpressionChecker', () => {
  passingCases.forEach((testCase) => {
    it(`passes: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (testCase as any).fileExtension)!;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (testCase as any).fileExtension)!;
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
