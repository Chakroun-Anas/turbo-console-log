import { ternaryChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/ternaryChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('ternaryChecker - basic passing case', () => {
  it('should detect a ternary in a variable initializer', () => {
    const documents = [
      {
        lines: ["const result = condition ? 'yes' : 'no';"],
        selectionLine: 0,
        variableName: 'result',
      },
      {
        name: 'parenthesized ternary',
        lines: ['const value = (condition ? 1 : 0);'],
        selectionLine: 0,
        variableName: 'value',
      },
      {
        name: 'type asserted ternary',
        lines: ['const typed = (condition ? 42 : 0) as number;'],
        selectionLine: 0,
        variableName: 'typed',
      },
      {
        name: 'ternary in array destructuring',
        lines: ['const [x = condition ? 1 : 2] = arr;'],
        selectionLine: 0,
        variableName: 'x',
      },
      {
        name: 'ternary in object destructuring',
        lines: ['const { a = cond ? "a" : "b" } = obj;'],
        selectionLine: 0,
        variableName: 'a',
      },
      {
        name: 'nested destructuring with ternary',
        lines: [
          'const { config: { apiKey = condition ? "yes" : "no" } } = settings;',
        ],
        selectionLine: 0,
        variableName: 'apiKey',
      },
      {
        name: 'multi-line ternary',
        lines: ['const multi =', "  condition ? 'yes' : 'no';"],
        selectionLine: 0,
        variableName: 'multi',
      },
      {
        name: 'nested (double) ternary',
        lines: ["const out = cond1 ? (cond2 ? 'a' : 'b') : 'c';"],
        selectionLine: 0,
        variableName: 'out',
      },
      {
        name: 'ternary buried in call expression',
        lines: ["const status = getValue(cond ? 'yes' : 'no');"],
        selectionLine: 0,
        variableName: 'status',
      },
      {
        name: 'alias destructuring with default ternary',
        lines: ['const { apiKey: key = cond ? "yes" : "no" } = obj;'],
        selectionLine: 0,
        variableName: 'key',
      },
    ];

    for (const document of documents) {
      const textDocument = makeTextDocument(document.lines);
      const result = ternaryChecker(
        textDocument,
        document.selectionLine,
        document.variableName,
      );
      expect(result.isChecked).toBe(true);
    }
  });
  it('ternaryChecker - should NOT detect ternary when it should not', () => {
    const documents = [
      {
        name: 'no ternary at all - clean formatting',
        lines: ['const user = {', "  name: 'Anas',", '  age: 30,', '};'],
        selectionLine: 0,
        variableName: 'user',
      },
      {
        name: 'ternary exists but on different variable below',
        lines: [
          'const config = { retries: 3 };',
          '',
          "const mode = isDev ? 'debug' : 'prod';",
        ],
        selectionLine: 0,
        variableName: 'config',
      },
      {
        name: 'ternary in deep nested variable, wrong target',
        lines: [
          'const settings = {',
          '  theme: "light",',
          '  flags: {',
          '    isBeta: cond ? true : false',
          '  }',
          '};',
        ],
        selectionLine: 1,
        variableName: 'theme',
      },
      {
        name: 'inline comment with ternary syntax',
        lines: ["const status = 'active'; // could be cond ? 'on' : 'off'"],
        selectionLine: 0,
        variableName: 'status',
      },
      {
        name: 'ternary exists but destructured variable doesn’t match',
        lines: ['const {', '  apiKey = cond ? "yes" : "no",', '} = config;'],
        selectionLine: 1,
        variableName: 'region',
      },
      {
        name: 'multiple vars declared, cursor on unrelated one',
        lines: ['const x = 1,', '      y = cond ? 2 : 3,', '      z = 42;'],
        selectionLine: 0,
        variableName: 'x',
      },
      {
        name: 'ternary in other var inside same object scope',
        lines: [
          'const props = {',
          "  title: 'Hello',",
          '  color: theme === "dark" ? "#000" : "#fff",',
          '};',
        ],
        selectionLine: 1,
        variableName: 'title',
      },
      {
        name: 'destructured alias, but targeting wrong alias',
        lines: ['const { apiKey: key = cond ? "yes" : "no" } = obj;'],
        selectionLine: 0,
        variableName: 'apiKey', // Wrong focus: it's bound to 'key'
      },
      {
        name: 'function call with ternary inside, wrong variable',
        lines: [
          "const formatted = formatText(cond ? 'bold' : 'light');",
          "const type = 'standard';",
        ],
        selectionLine: 1,
        variableName: 'type',
      },
      {
        name: 'multiline object, cursor on non-ternary key',
        lines: [
          'const options = {',
          "  size: 'M',",
          "  mode: isLarge ? 'expanded' : 'compact',",
          '};',
        ],
        selectionLine: 1,
        variableName: 'size',
      },
    ];

    for (const doc of documents) {
      const textDocument = makeTextDocument(doc.lines);
      const result = ternaryChecker(
        textDocument,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    }
  });
});
