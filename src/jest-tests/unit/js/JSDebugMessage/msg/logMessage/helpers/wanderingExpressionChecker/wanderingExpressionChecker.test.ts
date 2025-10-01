import { wanderingExpressionChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/wanderingExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('wanderingExpressionChecker', () => {
  passingCases.forEach(({ name, lines, selectionLine, variableName }) => {
    it(`passes: ${name}`, () => {
      const document = makeTextDocument(lines);
      const ast = parseCode(document.getText())!;
      const result = wanderingExpressionChecker(
        ast,
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  });

  failingCases.forEach(({ name, lines, selectionLine, variableName }) => {
    it(`fails: ${name}`, () => {
      const document = makeTextDocument(lines);
      const ast = parseCode(document.getText())!;
      const result = wanderingExpressionChecker(
        ast,
        document,
        selectionLine,
        variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  });
});
