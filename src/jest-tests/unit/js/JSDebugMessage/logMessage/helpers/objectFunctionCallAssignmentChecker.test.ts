import { objectFunctionCallAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/objectFunctionCallAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const passingCases = [
  {
    name: 'simple object function call',
    lines: ['const result = user.getName();'],
    selectionLine: 0,
    variableName: 'result',
  },
  {
    name: 'object function call with args',
    lines: ['const response = api.fetch("/data");'],
    selectionLine: 0,
    variableName: 'response',
  },
  {
    name: 'chained object method call',
    lines: ['const value = config.getSettings().toString();'],
    selectionLine: 0,
    variableName: 'value',
  },
  {
    name: 'deeply nested chain across lines',
    lines: [
      'const finalResult = user',
      '  .getProfile()',
      '  .settings()',
      '  .theme.getColor();',
    ],
    selectionLine: 0,
    variableName: 'finalResult',
  },
  {
    name: 'function call with destructured assignment',
    lines: ['const { data } = client.getResponse();'],
    selectionLine: 0,
    variableName: 'data',
  },
  {
    name: 'optional chaining with object method',
    lines: ['const userInfo = session?.getUser()?.info();'],
    selectionLine: 0,
    variableName: 'userInfo',
  },
  {
    name: 'type asserted object method result',
    lines: ['const typed = (api.get() as Response).status();'],
    selectionLine: 0,
    variableName: 'typed',
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
  },
];

const failingCases = [
  {
    name: 'object literal instead of function call',
    lines: ['const user = { name: "Anas" };'],
    selectionLine: 0,
    variableName: 'user',
  },
  {
    name: 'function call not assigned to a variable',
    lines: ['logger.log("hello");'],
    selectionLine: 0,
    variableName: 'log',
  },
  {
    name: 'variable assigned from primitive',
    lines: ['const count = 5;'],
    selectionLine: 0,
    variableName: 'count',
  },
];

describe('objectFunctionCallAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`should detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectFunctionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect object function call – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = objectFunctionCallAssignmentChecker(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
