import { templateStringLine } from '@/debug-message/js/JSDebugMessageLine/helpers/templateStringLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const testCases = [
  {
    name: 'simple single-line template with expression',
    lines: ['const greeting = `Hello ${name}`;'],
    selectionLine: 0,
    variableName: 'greeting',
    expectedLine: 1,
  },
  {
    name: 'simple single-line template no expressions',
    lines: ['const plain = `Just a string`;'],
    selectionLine: 0,
    variableName: 'plain',
    expectedLine: 1,
  },
  {
    name: 'multi-line template with three lines',
    lines: ['const longText = `Line 1', 'Line 2', 'Line 3`;'],
    selectionLine: 0,
    variableName: 'longText',
    expectedLine: 3,
  },
  {
    name: 'multi-line template with two lines',
    lines: ['const text = `Lorem', 'ipsum`;'],
    selectionLine: 0,
    variableName: 'text',
    expectedLine: 2,
  },
  {
    name: 'tagged multi-line template literal',
    lines: [
      'const styled = css`',
      '  background: red;',
      '  color: white;',
      '`;',
    ],
    selectionLine: 0,
    variableName: 'styled',
    expectedLine: 4,
  },
];

describe('templateStringLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = templateStringLine(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
