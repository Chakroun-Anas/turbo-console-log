import { namedFunctionAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/namedFunctionAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('namedFunctionAssignmentChecker', () => {
  const passingCases = [
    {
      name: 'classic named function expression',
      lines: ['const handler = function () { console.log("hi"); };'],
      selectionLine: 0,
      variableName: 'handler',
    },
    {
      name: 'arrow function assignment',
      lines: ['const run = () => console.log("go");'],
      selectionLine: 0,
      variableName: 'run',
    },
    {
      name: 'arrow function block body',
      lines: [
        'const doWork = () => {',
        '  const x = 42;',
        '  console.log(x);',
        '};',
      ],
      selectionLine: 0,
      variableName: 'doWork',
    },
    {
      name: 'function assigned to object property',
      lines: ['obj.log = function () { console.log("hi"); };'],
      selectionLine: 0,
      variableName: 'log',
    },
    {
      name: 'arrow function assigned to object property',
      lines: ['logger.debug = () => console.debug("trace");'],
      selectionLine: 0,
      variableName: 'debug',
    },
  ];

  const failingCases = [
    {
      name: 'non-function assignment',
      lines: ['const count = 123;'],
      selectionLine: 0,
      variableName: 'count',
    },
    {
      name: 'function call assignment',
      lines: ['const result = compute();'],
      selectionLine: 0,
      variableName: 'result',
    },
    {
      name: 'declaration below selected line',
      lines: ['let sum;', 'sum = () => 5;'],
      selectionLine: 0,
      variableName: 'sum',
    },
    {
      name: 'different variable name',
      lines: ['const handleClick = () => {};'],
      selectionLine: 0,
      variableName: 'onClick',
    },
  ];

  for (const test of passingCases) {
    it(`should detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = namedFunctionAssignmentChecker(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should NOT detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = namedFunctionAssignmentChecker(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
