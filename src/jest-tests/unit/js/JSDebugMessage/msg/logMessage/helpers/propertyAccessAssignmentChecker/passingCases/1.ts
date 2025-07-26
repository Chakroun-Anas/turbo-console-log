export default {
  name: 'optional chaining on workspace folders',
  lines: [
    'const currentRoot = vscode.workspace?.workspaceFolders?.[0]?.uri.fsPath;',
  ],
  selectionLine: 0,
  variableName: 'currentRoot',
};
