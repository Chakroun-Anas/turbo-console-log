import { functionAssignmentLine } from '@/debug-message/js/JSDebugMessageLine/helpers/functionAssignmentLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('functionAssignmentLine – insert after function assignments', () => {
  const cases = [
    {
      name: 'named function expression assigned to variable',
      lines: [
        'const doStuff = function doStuff() {',
        '  console.log("doing");',
        '};',
        'execute();',
      ],
      selectionLine: 0,
      selectedVar: 'doStuff',
      expectedLine: 3,
    },
    {
      name: 'arrow function assigned to variable, block body',
      lines: [
        'const compute = (x: number) => {',
        '  return x * 2;',
        '};',
        'console.log(compute(4));',
      ],
      selectionLine: 0,
      selectedVar: 'compute',
      expectedLine: 3,
    },
    {
      name: 'arrow function assigned to variable, concise body',
      lines: [
        'const double = (n: number) => n * 2;',
        'console.log(double(4));',
      ],
      selectionLine: 0,
      selectedVar: 'double',
      expectedLine: 1,
    },
    {
      name: 'async arrow function with block body',
      lines: [
        'const fetchData = async () => {',
        '  const res = await fetch("/api");',
        '  return await res.json();',
        '};',
        'fetchData();',
      ],
      selectionLine: 0,
      selectedVar: 'fetchData',
      expectedLine: 4,
    },
    {
      name: 'arrow function with type assertion (as)',
      lines: [
        'const handler = (() => {',
        '  return true;',
        '}) as () => boolean;',
        'console.log(handler());',
      ],
      selectionLine: 0,
      selectedVar: 'handler',
      expectedLine: 3,
    },
    {
      name: 'arrow function inside parentheses',
      lines: [
        'const wrapped = (',
        '  () => {',
        '    return 42;',
        '  }',
        ');',
        'console.log(wrapped());',
      ],
      selectionLine: 0,
      selectedVar: 'wrapped',
      expectedLine: 4,
    },
    {
      name: 'named function expression with inner block comment',
      lines: [
        'const log = function log() {',
        '  // log something important',
        '  console.log("inside");',
        '};',
        'log();',
      ],
      selectionLine: 0,
      selectedVar: 'log',
      expectedLine: 4,
    },
    {
      name: 'function assigned with newline before name',
      lines: [
        'const',
        '  weird = function () {',
        '    return "ok";',
        '  };',
        'console.log(weird());',
      ],
      selectionLine: 1,
      selectedVar: 'weird',
      expectedLine: 4,
    },
    {
      name: 'arrow function spanning multiple lines before body',
      lines: [
        'const add =',
        '(a: number, b: number)',
        '=> {',
        '  return a + b;',
        '};',
        'console.log(add(1, 2));',
      ],
      selectionLine: 0,
      selectedVar: 'add',
      expectedLine: 5,
    },
  ];

  for (const doc of cases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionAssignmentLine(
        document,
        doc.selectionLine,
        doc.selectedVar,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
