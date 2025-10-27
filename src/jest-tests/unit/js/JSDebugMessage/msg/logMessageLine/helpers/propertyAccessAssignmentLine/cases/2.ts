export default {
  name: 'multiline dot-chain (method 1)',
  lines: [
    'const currentRoot = vscode',
    '  .workspace?.workspaceFolders?.[0]?.uri.fsPath;',
    'if (currentRoot) { console.log(currentRoot); }',
  ],
  fileExtension: '.ts',
  selectionLine: 0,
  variableName: 'currentRoot',
  expectedLine: 2,
};
