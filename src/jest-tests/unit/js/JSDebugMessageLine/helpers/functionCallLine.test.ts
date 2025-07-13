import { functionCallLine } from '@/debug-message/js/JSDebugMessageLine/helpers/functionCallLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const testCases = [
  {
    name: 'simple single-line call',
    lines: ['const result = fn();'],
    selectionLine: 0,
    variableName: 'result',
    expectedLine: 1,
  },
  {
    name: 'chained method call on single line',
    lines: ['const value = user.getProfile().getName();'],
    selectionLine: 0,
    variableName: 'value',
    expectedLine: 1,
  },
  {
    name: 'multi-line object passed to function',
    lines: [
      'const result = doSomething({',
      '  key: "value",',
      '  debug: true',
      '});',
    ],
    selectionLine: 0,
    variableName: 'result',
    expectedLine: 4,
  },
  {
    name: 'function call with array arg',
    lines: ['const processed = process([', '  1, 2, 3,', ']);'],
    selectionLine: 0,
    variableName: 'processed',
    expectedLine: 3,
  },
  {
    name: 'function call with nested calls and config object',
    lines: [
      'const result = callApi({',
      '  headers: getHeaders(),',
      '  payload: buildPayload(user),',
      '});',
    ],
    selectionLine: 0,
    variableName: 'result',
    expectedLine: 4,
  },
  {
    name: 'async function call inside IIFE',
    lines: [
      'const data = await (async () => {',
      '  return await fetchData();',
      '})();',
    ],
    selectionLine: 0,
    variableName: 'data',
    expectedLine: 3,
  },
  {
    name: 'template literal passed as argument',
    lines: ['const query = send(`', '  SELECT *', '  FROM users', '`);'],
    selectionLine: 0,
    variableName: 'query',
    expectedLine: 4,
  },
  {
    name: 'callback function passed as argument',
    lines: [
      'const handler = setListener("click", () => {',
      '  console.log("clicked");',
      '});',
    ],
    selectionLine: 0,
    variableName: 'handler',
    expectedLine: 3,
  },
  {
    name: 'function returning function call',
    lines: ['const final = wrapper(fn());'],
    selectionLine: 0,
    variableName: 'final',
    expectedLine: 1,
  },
  {
    name: 'function call with deeply nested config',
    lines: [
      'const res = compute({',
      '  data: [',
      '    { id: 1, name: "A" },',
      '    { id: 2, name: "B" },',
      '  ]',
      '});',
    ],
    selectionLine: 0,
    variableName: 'res',
    expectedLine: 6,
  },
  {
    name: 'function call with comment inside args',
    lines: [
      'const output = transform({',
      '  // this controls the speed',
      '  speed: "fast"',
      '});',
    ],
    selectionLine: 0,
    variableName: 'output',
    expectedLine: 4,
  },
  {
    name: 'curried function call',
    lines: ['const composed = pipe(fnA)(fnB)(fnC);'],
    selectionLine: 0,
    variableName: 'composed',
    expectedLine: 1,
  },
  {
    name: 'function call inside object literal queryFn',
    lines: [
      'const currencies = useQuery({',
      '  enabled: false,',
      '  queryFn: () => sdk.unified.getCurrencies(),',
      "  queryKey: ['settings', 'currencies'],",
      '});',
    ],
    selectionLine: 0,
    variableName: 'currencies',
    expectedLine: 5,
  },
  {
    name: 'function call with template literal and options object',
    lines: [
      'const proc = exec(',
      '  `java -jar ${googleJavaFormatPath} --dry-run $(${javaFilesCommand})`,',
      '  { silent: true },',
      ');',
    ],
    selectionLine: 0,
    variableName: 'proc',
    expectedLine: 4,
  },
  {
    name: 'reduce call with object accumulator function',
    lines: [
      'const values = FLAG_COLUMNS.reduce((acc, key) => {',
      '  acc[key] = FLAG_CONFIG[key](flag);',
      '  return acc;',
      '}, {});',
    ],
    selectionLine: 0,
    variableName: 'values',
    expectedLine: 4,
  },
  {
    name: 'reduce call inside a for-loop following a method subscription',
    lines: [
      '// @ts-nocheck',
      '',
      'function someFunc() {',
      '  this.subscription = this.userService.currentUser.subscribe(',
      '    (userData: User) => {',
      '      this.canModify = userData.username === this.comment.author.username;',
      '    },',
      '  );',
      '}',
      '',
      'for (const flag of filteredFlags) {',
      '  const values = FLAG_COLUMNS.reduce((acc, key) => {',
      '    acc[key] = FLAG_CONFIG[key](flag);',
      '    return acc;',
      '  }, {});',
      '}',
    ],
    selectionLine: 11,
    variableName: 'values',
    expectedLine: 15,
  },
];

describe('functionCallLine', () => {
  for (const doc of testCases) {
    it(`should return correct insertion line – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = functionCallLine(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(doc.expectedLine);
    });
  }
});
