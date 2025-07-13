import { functionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/functionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('functionCallAssignmentChecker', () => {
  const passingCases = [
    {
      name: 'simple function call assignment',
      lines: ['const result = doSomething();'],
      selectionLine: 0,
      variableName: 'result',
    },
    {
      name: 'async function call assignment',
      lines: ['const data = await fetchData();'],
      selectionLine: 0,
      variableName: 'data',
    },
    {
      name: 'function call with arguments',
      lines: ['let value = calculate(10, 20);'],
      selectionLine: 0,
      variableName: 'value',
    },
    {
      name: 'multi-line function call with arguments',
      lines: ['const result = someFunction(', '  10,', '  20,', ');'],
      selectionLine: 0,
      variableName: 'result',
    },
    {
      name: 'function call with object as argument',
      lines: [
        'const config = setup({',
        '  env: "prod",',
        '  debug: false',
        '});',
      ],
      selectionLine: 0,
      variableName: 'config',
    },
    {
      name: 'type asserted function call',
      lines: ['const typed = (run() as number);'],
      selectionLine: 0,
      variableName: 'typed',
    },
    {
      name: 'parenthesized function call',
      lines: ['const value = (process());'],
      selectionLine: 0,
      variableName: 'value',
    },
    {
      name: 'function call with nested calls',
      lines: ['const final = wrap(transform(data));'],
      selectionLine: 0,
      variableName: 'final',
    },
    {
      name: 'function call with template literals',
      lines: ['const out = format(`value: ${getVal()}`);'],
      selectionLine: 0,
      variableName: 'out',
    },
    {
      name: 'awaited function with then chain',
      lines: ['const response = await api.fetch().then(res => res.json());'],
      selectionLine: 0,
      variableName: 'response',
    },
  ];

  const failingCases = [
    {
      name: 'function call not assigned',
      lines: ['doSomething();'],
      selectionLine: 0,
      variableName: 'result',
    },
    {
      name: 'primitive assignment',
      lines: ['const x = 42;'],
      selectionLine: 0,
      variableName: 'x',
    },
  ];

  for (const doc of passingCases) {
    it(`✓ should detect function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`✗ should not detect function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
