export default {
  name: 'multiline dot-chain (method 2)',
  lines: [
    'const currentRoot = vscode.',
    '  workspace?.workspaceFolders?.[0]?.uri.fsPath;',
    'async function newChapter(): Promise<boolean> {',
    'return true;',
    '}',
  ],
  fileExtension: '.ts',
  selectionLine: 0,
  variableName: 'currentRoot',
  expectedLine: 2,
};
