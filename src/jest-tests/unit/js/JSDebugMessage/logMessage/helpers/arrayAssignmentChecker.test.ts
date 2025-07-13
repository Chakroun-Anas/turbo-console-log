import { arrayAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/arrayAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const passingCases = [
  {
    name: 'simple array assignment',
    lines: ['const values = [1, 2, 3];'],
    selectionLine: 0,
    variableName: 'values',
  },
  {
    name: 'empty array assignment',
    lines: ['const items = [];'],
    selectionLine: 0,
    variableName: 'items',
  },
  {
    name: 'multi-line array assignment',
    lines: ['const numbers = [', '  1, 2, 3', '];'],
    selectionLine: 0,
    variableName: 'numbers',
  },
  {
    name: 'multi-line with trailing comma',
    lines: ['const list = [', '  "a",', '  "b",', '];'],
    selectionLine: 0,
    variableName: 'list',
  },
  {
    name: 'array opening bracket on next line',
    lines: ['const data =', '[1, 2, 3];'],
    selectionLine: 0,
    variableName: 'data',
  },
  {
    name: 'array split over multiple lines with spaces',
    lines: ['const data =', '  [1, 2, 3];'],
    selectionLine: 0,
    variableName: 'data',
  },
  {
    name: 'array with inline comment after assignment',
    lines: ['const data = [1, 2, 3]; // numbers'],
    selectionLine: 0,
    variableName: 'data',
  },
  {
    name: 'array declared using let',
    lines: ['let list = [true, false];'],
    selectionLine: 0,
    variableName: 'list',
  },
  {
    name: 'array declared using var',
    lines: ['var flags = [true, true];'],
    selectionLine: 0,
    variableName: 'flags',
  },
  {
    name: 'array assignment with spread and map inside object property',
    lines: [
      'config.module.rules = [',
      '  ...filterModuleRules(config),',
      '  ...nextWebpackConfig.module.rules.map((rule) => {',
      "    if (rule.use && rule.use.loader === 'next-babel-loader') {",
      '      rule.use.loader = require.resolve(',
      "        'next/dist/build/webpack/loaders/next-babel-loader',",
      '      );',
      '    }',
      '    return rule;',
      '  }),',
      '];',
    ],
    selectionLine: 0,
    variableName: 'config.module.rules',
  },
];

const failingCases = [
  {
    name: 'not an array assignment',
    lines: ['const count = 5;'],
    selectionLine: 0,
    variableName: 'count',
  },
  {
    name: 'array assigned on line below',
    lines: ['let list;', 'list = [1, 2, 3];'],
    selectionLine: 0,
    variableName: 'list',
  },
];

describe('arrayAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`should detect array assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = arrayAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect array assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = arrayAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
