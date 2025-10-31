export default {
  name: 'optional chaining on workspace folders',
  fileExtension: '.ts',
  lines: [
    'const currentRoot = vscode.workspace?.workspaceFolders?.[0]?.uri.fsPath;',
  ],
  selectionLine: 0,
  variableName: 'currentRoot',
};
