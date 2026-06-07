import { withinConditionBlockChecker } from '@/debug-message/python/PythonDebugMessage/msg/logMessage/helpers/withinConditionBlockChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('Python withinConditionBlockChecker', () => {
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines, 'test.py', 'python');
        const program = parseCode(doc);
        const result = withinConditionBlockChecker(
          program,
          doc,
          testCase.selectionLine,
          testCase.variableName,
        );
        expect(result.isChecked).toBe(true);
      });
    }
  });

  describe('failing cases', () => {
    for (const testCase of failingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines, 'test.py', 'python');
        const program = parseCode(doc);
        const result = withinConditionBlockChecker(
          program,
          doc,
          testCase.selectionLine,
          testCase.variableName,
        );
        expect(result.isChecked).toBe(false);
      });
    }
  });
});
