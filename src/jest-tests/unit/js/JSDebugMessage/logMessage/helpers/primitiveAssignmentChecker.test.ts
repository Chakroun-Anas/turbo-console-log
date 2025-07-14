import { primitiveAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/primitiveAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('primitiveAssignmentChecker', () => {
  const passingCases = [
    {
      name: 'number literal',
      lines: ['const value = 42;'],
      selectionLine: 0,
      variableName: 'value',
    },
    {
      name: 'string literal',
      lines: [`const msg = "hello world";`],
      selectionLine: 0,
      variableName: 'msg',
    },
    {
      name: 'true boolean literal',
      lines: [`const isReady = true;`],
      selectionLine: 0,
      variableName: 'isReady',
    },
    {
      name: 'identifier',
      lines: [`const copy = value;`],
      selectionLine: 0,
      variableName: 'copy',
    },
    {
      name: 'destructured from identifier',
      lines: [`const { name } = user;`],
      selectionLine: 0,
      variableName: 'name',
    },
    {
      name: 'destructured from dot chain',
      lines: [`const { age } = user.profile.details;`],
      selectionLine: 0,
      variableName: 'age',
    },
    {
      name: 'undefined literal',
      lines: ['const unknown = undefined;'],
      selectionLine: 0,
      variableName: 'unknown',
    },
    {
      name: 'multi-line destructured from identifier',
      lines: ['const {', '  firstName,', '  lastName', '} = user;'],
      selectionLine: 1,
      variableName: 'firstName',
    },
  ];

  for (const testCase of passingCases) {
    it(`should detect: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const result = primitiveAssignmentChecker(
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  const failingCases = [
    {
      name: 'function call assignment',
      lines: ['const data = fetchData();'],
      selectionLine: 0,
      variableName: 'data',
    },
    {
      name: 'object literal',
      lines: ['const person = { name: "Joe" };'],
      selectionLine: 0,
      variableName: 'person',
    },
    {
      name: 'array literal',
      lines: ['const items = [1, 2, 3];'],
      selectionLine: 0,
      variableName: 'items',
    },
    {
      name: 'destructured from function call',
      lines: ['const { x } = getCoords();'],
      selectionLine: 0,
      variableName: 'x',
    },
  ];

  for (const testCase of failingCases) {
    it(`should reject: ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const result = primitiveAssignmentChecker(
        doc,
        testCase.selectionLine,
        testCase.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
