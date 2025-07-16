import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { propertyAccessAssignmentLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/propertyAccessAssignmentLine';

describe('propertyAccessAssignmentLine – insert after property access assignment', () => {
  const cases = [
    {
      name: 'one-line property access',
      lines: ['const env = process.env.NODE_ENV;'],
      selectionLine: 0,
      variableName: 'env',
      expectedLine: 1,
    },
    {
      name: 'multiline dot-chain (method 1)',
      lines: [
        'const currentRoot = vscode',
        '  .workspace?.workspaceFolders?.[0]?.uri.fsPath;',
        'if (currentRoot) { console.log(currentRoot); }',
      ],
      selectionLine: 0,
      variableName: 'currentRoot',
      expectedLine: 2,
    },
    {
      name: 'multiline dot-chain (method 2)',
      lines: [
        'const currentRoot = vscode.',
        '  workspace?.workspaceFolders?.[0]?.uri.fsPath;',
        'async function newChapter(): Promise<boolean> {',
        'return true;',
        '}',
      ],
      selectionLine: 0,
      variableName: 'currentRoot',
      expectedLine: 2,
    },
    {
      name: 'breaks on new assignment',
      lines: ['const a = obj.prop;', 'const b = 42;'],
      selectionLine: 0,
      variableName: 'a',
      expectedLine: 1,
    },
    {
      name: 'bracket-first continuation',
      lines: ['const first = list', '  [0].title;', 'console.log(first);'],
      selectionLine: 0,
      variableName: 'first',
      expectedLine: 2,
    },
    {
      name: 'deep property access inside method assignment (this.subscription)',
      lines: [
        'function someFunc() {',
        '  this.subscription = this.userService.currentUser.subscribe(',
        '    (userData: User) => {',
        '      this.canModify = userData.username === this.comment.author.username;',
        '    },',
        '  );',
        '}',
      ],
      selectionLine: 1,
      variableName: 'this.subscription',
      expectedLine: 6,
    },
  ];

  for (const test of cases) {
    it(`should return correct insertion line – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = propertyAccessAssignmentLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
