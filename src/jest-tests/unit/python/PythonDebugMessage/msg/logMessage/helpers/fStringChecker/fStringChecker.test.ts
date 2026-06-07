import { fStringChecker } from '@/debug-message/python/PythonDebugMessage/msg/logMessage/helpers/fStringChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';
import passingCases from './passingCases';
import failingCases from './failingCases';

describe('Python fStringChecker', () => {
  describe('passing cases', () => {
    for (const testCase of passingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines, 'test.py', 'python');
        const result = fStringChecker(parseCode(doc), doc, testCase.selectionLine, testCase.variableName);
        expect(result.isChecked).toBe(true);
      });
    }
  });
  describe('failing cases', () => {
    for (const testCase of failingCases) {
      it(testCase.name, () => {
        const doc = makeTextDocument(testCase.lines, 'test.py', 'python');
        const result = fStringChecker(parseCode(doc), doc, testCase.selectionLine, testCase.variableName);
        expect(result.isChecked).toBe(false);
      });
    }
  });
});
