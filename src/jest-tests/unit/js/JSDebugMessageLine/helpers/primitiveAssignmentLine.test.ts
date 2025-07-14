import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { primitiveAssignmentLine } from '@/debug-message/js/JSDebugMessageLine/helpers/primitiveAssignmentLine';

describe('primitiveAssignmentLine', () => {
  const passingCases = [
    {
      name: 'number literal',
      lines: ['const count = 10;', 'return count;'],
      selectionLine: 0,
      variableName: 'count',
      expectedLine: 1,
    },
    {
      name: 'string literal',
      lines: ['const message = "hello";', 'doSomething();'],
      selectionLine: 0,
      variableName: 'message',
      expectedLine: 1,
    },
    {
      name: 'undefined literal',
      lines: ['const thing = undefined;', 'log();'],
      selectionLine: 0,
      variableName: 'thing',
      expectedLine: 1,
    },
    {
      name: 'identifier assignment',
      lines: ['const copy = other;', 'return copy;'],
      selectionLine: 0,
      variableName: 'copy',
      expectedLine: 1,
    },
    {
      name: 'dot-chain identifier',
      lines: ['const version = app.config.version;', 'next();'],
      selectionLine: 0,
      variableName: 'version',
      expectedLine: 1,
    },
    {
      name: 'object destructuring single line',
      lines: ['const { user } = state;', 'return user;'],
      selectionLine: 0,
      variableName: 'user',
      expectedLine: 1,
    },
    {
      name: 'object destructuring multiline',
      lines: [
        'const {',
        '  config,',
        '  env,',
        '} = process;',
        'console.log(config);',
      ],
      selectionLine: 1,
      variableName: 'config',
      expectedLine: 4,
    },
  ];

  for (const test of passingCases) {
    it(`should return correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const line = primitiveAssignmentLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
