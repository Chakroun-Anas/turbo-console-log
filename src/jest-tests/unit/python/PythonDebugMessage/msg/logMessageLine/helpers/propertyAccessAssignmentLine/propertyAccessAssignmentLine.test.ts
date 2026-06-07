import { propertyAccessAssignmentLine } from '@/debug-message/python/PythonDebugMessage/msg/logMessageLine/helpers/propertyAccessAssignmentLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';
import testCases from './cases';

describe('Python propertyAccessAssignmentLine', () => {
  for (const testCase of testCases) {
    it(`should return correct line for: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines, 'test.py', 'python');
      const line = propertyAccessAssignmentLine(parseCode(doc), doc, testCase.selectionLine);
      expect(line).toBe(testCase.expectedLine);
    });
  }
});
