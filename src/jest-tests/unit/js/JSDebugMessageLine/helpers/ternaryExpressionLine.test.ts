import { ternaryExpressionLine } from '@/debug-message/js/JSDebugMessageLine/helpers/ternaryExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const testCases = [
  {
    name: 'single-line ternary',
    lines: ["const result = condition ? 'yes' : 'no';"],
    variableName: 'result',
    selectionLine: 0,
    expectedLine: 1,
  },
  {
    name: 'multi-line ternary assignment',
    lines: [
      'const argTargetDir = argv._[0]',
      '  ? formatTargetDir(String(argv._[0]))',
      '  : undefined;',
    ],
    selectionLine: 0,
    variableName: 'argTargetDir',
    expectedLine: 3,
  },
  {
    name: 'parenthesized ternary in assignment',
    lines: ["const val = (cond ? 'x' : 'y');", 'doSomething(val);'],
    selectionLine: 0,
    variableName: 'val',
    expectedLine: 1,
  },
  {
    name: 'ternary inside function return',
    lines: [
      'function getStatus() {',
      "  return cond ? 'success' : 'fail';",
      '}',
      'console.log(getStatus());',
    ],
    selectionLine: 1,
    variableName: 'cond',
    expectedLine: 2,
  },
  {
    name: 'nested ternary inside assignment',
    lines: [
      'const output = cond1',
      "  ? (cond2 ? 'A' : 'B')",
      "  : 'C';",
      'console.log(output);',
    ],
    selectionLine: 0,
    variableName: 'output',
    expectedLine: 3,
  },
  {
    name: 'ternary as default value in object',
    lines: [
      'const config = {',
      "  level: env === 'dev' ? 'debug' : 'info',",
      '};',
      'init(config);',
    ],
    selectionLine: 1,
    variableName: 'config',
    expectedLine: 2,
  },
  {
    name: 'ternary in deeply nested call expression',
    lines: [
      "const value = format(config.useColor ? 'color' : 'mono');",
      'console.log(value);',
    ],
    selectionLine: 0,
    variableName: 'value',
    expectedLine: 1,
  },
  {
    name: 'ternary in array element',
    lines: ["const arr = [cond ? 'a' : 'b', 'c'];", 'console.log(arr);'],
    selectionLine: 0,
    variableName: 'arr',
    expectedLine: 1,
  },
  {
    name: 'multi-line return with ternary',
    lines: [
      'function check() {',
      '  return cond',
      "    ? 'valid'",
      "    : 'invalid';",
      '}',
    ],
    selectionLine: 1,
    variableName: 'cond',
    expectedLine: 4,
  },
  {
    name: 'ternary inside variable with type annotation',
    lines: ["const mode: string = isDark ? 'dark' : 'light';", 'init(mode);'],
    selectionLine: 0,
    variableName: 'mode',
    expectedLine: 1,
  },
  {
    name: 'typescript ignored block with ternary',
    lines: [
      '// @ts-nocheck',
      'export const c =',
      '  // @ts-expect-error',
      "  typeof React.__COMPILER_RUNTIME?.c === 'function'",
      '    ? // @ts-expect-error',
      '      React.__COMPILER_RUNTIME.c',
      '    : function c(size: number) {',
      '        return React.useMemo<Array<unknown>>(() => {',
      '          const $ = new Array(size);',
      '          for (let ii = 0; ii < size; ii++) {',
      '            $[ii] = $empty;',
      '          }',
      '          // This symbol is added to tell the react devtools that this array is from',
      '          // useMemoCache.',
      '          // @ts-ignore',
      '          $[$empty] = true;',
      '          return $;',
      '        }, []);',
      '      };',
    ],
    selectionLine: 1,
    variableName: 'c',
    expectedLine: 19,
  },
];

describe('ternaryExpressionLine – various scenarios', () => {
  for (const test of testCases) {
    it(`returns correct line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const line = ternaryExpressionLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
