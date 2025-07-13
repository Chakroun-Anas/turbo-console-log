import { objectLiteralChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/objectLiteralChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const passingCases = [
  {
    name: 'multi-line object literal',
    lines: ['const config = {', '  darkMode: true,', '  theme: "light",', '};'],
    selectionLine: 0,
    variableName: 'config',
  },
  {
    name: 'nested object literal inside assignment',
    lines: [
      'const settings = {',
      '  layout: {',
      '    width: 1200,',
      '    height: 800',
      '  },',
      '  debug: true',
      '};',
    ],
    selectionLine: 0,
    variableName: 'settings',
  },
  {
    name: 'object literal with trailing comma',
    lines: ['const props = { foo: true, };'],
    selectionLine: 0,
    variableName: 'props',
  },
  {
    name: 'object literal with spread inside',
    lines: ['const merged = { ...defaults, override: true };'],
    selectionLine: 0,
    variableName: 'merged',
  },
];

const failingCases = [
  {
    name: 'object literal passed to function',
    lines: ['const something = doSomething({ debug: true });'],
    selectionLine: 0,
    variableName: 'something',
  },
  {
    name: 'object used as default param value',
    lines: ['function init(opts = { debug: false }) {}'],
    selectionLine: 0,
    variableName: 'opts',
  },
  {
    name: 'object returned from arrow function',
    lines: ['const get = () => { return { key: "value" }; };'],
    selectionLine: 0,
    variableName: 'get',
  },
  {
    name: 'object literal inside a ternary expression',
    lines: [
      'const result = isProd',
      '  ? { env: "production" }',
      '  : { env: "dev" };',
    ],
    selectionLine: 0,
    variableName: 'result',
  },
  {
    name: 'inline object used for destructuring',
    lines: ['const { debug } = { debug: true };'],
    selectionLine: 0,
    variableName: 'debug',
  },
];

describe('objectLiteralChecker', () => {
  for (const doc of passingCases) {
    it(`should detect object literal – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectLiteralChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect object literal – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectLiteralChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
