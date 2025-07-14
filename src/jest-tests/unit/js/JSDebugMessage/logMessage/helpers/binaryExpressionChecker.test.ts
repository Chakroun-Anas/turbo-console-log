import { binaryExpressionChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/binaryExpressionChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const passingCases = [
  {
    name: 'nullish coalescing assignment (??)',
    lines: ['const value = userInput ?? "default";'],
    selectionLine: 0,
    variableName: 'value',
  },
  {
    name: 'logical OR assignment (||)',
    lines: ['const setting = configValue || "fallback";'],
    selectionLine: 0,
    variableName: 'setting',
  },
  {
    name: 'logical AND assignment (&&)',
    lines: [
      'const ReactSecretInternals =',
      '  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE &&',
      '  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;',
    ],
    selectionLine: 0,
    variableName: 'ReactSecretInternals',
  },
  {
    name: 'parenthesized binary expression',
    lines: ['const output = (foo || bar);'],
    selectionLine: 0,
    variableName: 'output',
  },
  {
    name: 'standard arithmetic assignment (+)',
    lines: ['const sum = a + b;'],
    selectionLine: 0,
    variableName: 'sum',
  },
  {
    name: 'comparison assignment (===)',
    lines: ['const isEqual = a === b;'],
    selectionLine: 0,
    variableName: 'isEqual',
  },
  {
    name: 'complex multi-line expression',
    lines: ['const isValid =', '  (a && b && c) ||', '  (x !== y && z === 0);'],
    selectionLine: 0,
    variableName: 'isValid',
  },
];

const failingCases = [
  {
    name: 'unrelated primitive assignment',
    lines: ['const active = true;'],
    selectionLine: 0,
    variableName: 'active',
  },
  {
    name: 'assignment below declaration',
    lines: ['let state;', 'state = userInput ?? "fallback";'],
    selectionLine: 0,
    variableName: 'state',
  },
];

describe('binaryExpressionChecker', () => {
  for (const doc of passingCases) {
    it(`should detect binary expression assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = binaryExpressionChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect binary expression assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = binaryExpressionChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
