// arrayAssignmentLine.test.ts
import { arrayLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/arrayLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const testCases = [
  {
    name: 'simple array',
    lines: ['const values = [1, 2, 3];'],
    selectionLine: 0,
    variableName: 'values',
    expectedLine: 1,
  },
  {
    name: 'multi-line array',
    lines: ['const list = [', '  "a",', '  "b",', '];'],
    selectionLine: 0,
    variableName: 'list',
    expectedLine: 4,
  },
  {
    name: 'array with opening bracket on next line',
    lines: ['const items =', '[1, 2, 3];'],
    selectionLine: 0,
    variableName: 'items',
    expectedLine: 2,
  },
  {
    name: 'array declared with let and spaces',
    lines: ['let numbers = [', '  10, 20', '];'],
    selectionLine: 0,
    variableName: 'numbers',
    expectedLine: 3,
  },
  {
    name: 'array assignment to deeply nested object property',
    lines: [
      'config.module.rules = [',
      '  ...filterModuleRules(config),',
      '  ...nextWebpackConfig.module.rules.map((rule) => {',
      "    if (rule.use && rule.use.loader === 'next-babel-loader') {",
      "      rule.use.loader = require.resolve('next/dist/build/webpack/loaders/next-babel-loader');",
      '    }',
      '    return rule;',
      '  }),',
      '];',
    ],
    selectionLine: 0,
    variableName: 'config.module.rules',
    expectedLine: 9,
  },
];

describe('arrayAssignmentLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = arrayLine(document, doc.selectionLine, doc.variableName);
      expect(result).toBe(doc.expectedLine);
    });
  }
});
