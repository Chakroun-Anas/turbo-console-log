import { templateStringChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/templateStringChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const passingCases = [
  {
    name: 'simple template string',
    lines: ['const greeting = `Hello ${name}`;'],
    selectionLine: 0,
    variableName: 'greeting',
  },
  {
    name: 'template string with no expressions',
    lines: ['const plain = `Just a string`;'],
    selectionLine: 0,
    variableName: 'plain',
  },
  {
    name: 'multi-line template string starting line',
    lines: ['const longText = `Line 1', 'Line 2', 'Line 3`;'],
    selectionLine: 0,
    variableName: 'longText',
  },
  {
    name: 'template string with nested expression',
    lines: ['const result = `Score: ${score > 10 ? "High" : "Low"}`;'],
    selectionLine: 0,
    variableName: 'result',
  },
  {
    name: 'multi-line no-substitution template literal',
    lines: ['const query = `SELECT *', 'FROM users', 'WHERE id = 1`;'],
    selectionLine: 0,
    variableName: 'query',
  },
  {
    name: 'complex nested expressions',
    lines: [
      'const summary = `Total: ${a + b}, Avg: ${(a + b) / 2}, Max: ${Math.max(a, b)}`;',
    ],
    selectionLine: 0,
    variableName: 'summary',
  },
  {
    name: 'tagged template literal',
    lines: ['const styled = css`color: ${color};`;'],
    selectionLine: 0,
    variableName: 'styled',
  },
];

const failingCases = [
  {
    name: 'simple string with backtick character',
    lines: ['const text = "This is not a `template` string";'],
    selectionLine: 0,
    variableName: 'text',
  },
  {
    name: 'regular variable assignment',
    lines: ['const count = 5;'],
    selectionLine: 0,
    variableName: 'count',
  },
  {
    name: 'template syntax in comment',
    lines: ['const val = 42; // maybe use `template` later'],
    selectionLine: 0,
    variableName: 'val',
  },
];

describe('templateStringChecker', () => {
  for (const doc of passingCases) {
    it(`should detect template string – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = templateStringChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect template string – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = templateStringChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
