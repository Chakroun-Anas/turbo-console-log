import { binaryExpressionLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/binaryExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('binaryExpressionLine – insertion line after binary expression', () => {
  const documents = [
    {
      name: 'arithmetic assignment, single line',
      lines: ['const sum = a + b;', 'return sum;'],
      selectionLine: 0,
      variableName: 'sum',
      expectedLine: 1,
    },
    {
      name: 'comparison assignment with selection inside comment',
      lines: [
        '// prepare comparison',
        'const isEqual = a === b;',
        'doSomething(isEqual);',
      ],
      selectionLine: 1,
      variableName: 'isEqual',
      expectedLine: 2,
    },
    {
      name: 'logical AND assignment',
      lines: [
        'let x = 1;',
        'const result = isValid && isReady;',
        'return result;',
      ],
      selectionLine: 1,
      variableName: 'result',
      expectedLine: 2,
    },
    {
      name: 'nullish coalescing, selection on line 0',
      lines: ['const name = input ?? "Anonymous";', 'save(name);'],
      selectionLine: 0,
      variableName: 'name',
      expectedLine: 1,
    },
    {
      name: 'multi-line logical OR expression',
      lines: [
        'const config =',
        '  externalConfig ||',
        '  fallbackConfig;',
        'use(config);',
      ],
      selectionLine: 1,
      variableName: 'config',
      expectedLine: 3,
    },
    {
      name: 'complex binary expression, cursor in middle',
      lines: [
        'const status =',
        '  (a && b) ||',
        '  (c === d && e !== f);',
        'console.log(status);',
      ],
      selectionLine: 0,
      variableName: 'status',
      expectedLine: 3,
    },
    {
      name: 'parenthesized expression',
      lines: ['// pre-comment', 'const val = (x + y);', 'return val;'],
      selectionLine: 1,
      variableName: 'val',
      expectedLine: 2,
    },
    {
      name: 'binary with type annotation',
      lines: ['const total: number = price * quantity;', 'console.log(total);'],
      selectionLine: 0,
      variableName: 'total',
      expectedLine: 1,
    },
  ];

  for (const documnet of documents) {
    const doc = makeTextDocument(documnet.lines);
    const insertionLine = binaryExpressionLine(
      doc,
      documnet.selectionLine,
      documnet.variableName,
    );

    it(`returns correct insertion line – ${documnet.name}`, () => {
      expect(insertionLine).toBe(documnet.expectedLine);
    });
  }
});
