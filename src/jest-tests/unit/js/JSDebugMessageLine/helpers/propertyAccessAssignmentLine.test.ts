import { makeTextDocument } from '../../../../mocks/helpers/';
import { propertyAccessAssignmentLine } from '../../../../../debug-message/js/JSDebugMessageLine/helpers/propertyAccessAssignmentLine';

describe('propertyAccessAssignmentLine', () => {
  it('returns next line after a one-line property access assignment', () => {
    const lines = ['const env = process.env.NODE_ENV;'];
    const doc = makeTextDocument(lines);

    const result = propertyAccessAssignmentLine(doc, 0);

    expect(result).toBe(1);
  });
  it('deals with complex snippets right after the declaration access assignment', () => {
    const snippets: { name: string; lines: string[]; expected: number }[] = [
      {
        name: 'multiline dot-chain',
        lines: [
          'const currentRoot = vscode', // 0
          '  .workspace?.workspaceFolders?.[0]?.uri.fsPath;', // 1 (continues)
          'if (currentRoot) { console.log(currentRoot); }', // 2
        ],
        expected: 2, // should insert after continuation block
      },
      {
        name: 'multiline dot-chain',
        lines: [
          'const currentRoot = vscode.', // 0
          '  workspace?.workspaceFolders?.[0]?.uri.fsPath;', // 1 (continues)
          'async function newChapter(): Promise<boolean> {', // 2
          'return true;', // 3
          '}', // 4
        ],
        expected: 2, // should insert after continuation block
      },
      {
        name: 'breaks on new assignment',
        lines: [
          'const a = obj.prop;', // 0
          'const b = 42;', // 1 -> new assignment, stop here
        ],
        expected: 1,
      },
      {
        name: 'bracket-first continuation',
        lines: [
          'const first = list', // 0
          '  [0].title;', // 1 (starts with [)
          'console.log(first);', // 2
        ],
        expected: 2,
      },
    ];
    for (const snippet of snippets) {
      const { lines, expected } = snippet;
      const doc = makeTextDocument(lines);
      const result = propertyAccessAssignmentLine(doc, 0);
      expect(result).toBe(expected);
    }
  });
});
