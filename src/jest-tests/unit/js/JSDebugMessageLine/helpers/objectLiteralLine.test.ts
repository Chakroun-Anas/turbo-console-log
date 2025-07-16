import { objectLiteralLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/objectLiteralLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const testCases = [
  {
    name: 'single-line object literal',
    lines: ['const config = { darkMode: true };'],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 1,
  },
  {
    name: 'multi-line object literal – 2 lines',
    lines: ['const config = {', '  darkMode: true };'],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 2,
  },
  {
    name: 'multi-line object literal – 3 lines',
    lines: ['const config = {', "  theme: 'light',", '  darkMode: true };'],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 3,
  },
  {
    name: 'multi-line object literal – with closing on new line',
    lines: ['const config = {', "  theme: 'light',", '  darkMode: true', '};'],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 4,
  },
  {
    name: 'nested object inside object',
    lines: [
      'const config = {',
      '  theme: "light",',
      '  layout: { width: 1200, height: 800 }',
      '};',
    ],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 4,
  },
  {
    name: 'object with trailing comma at end',
    lines: ['const config = {', '  debug: true,', '};'],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 3,
  },
  {
    name: 'empty object literal',
    lines: ['const config = {};'],
    selectionLine: 0,
    variableName: 'config',
    expectedLine: 1,
  },
];

describe('objectLiteralLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectLiteralLine(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
