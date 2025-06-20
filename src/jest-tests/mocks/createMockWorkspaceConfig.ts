import * as vscode from 'vscode';

export function createMockWorkspaceConfig(
  overrides: Partial<vscode.WorkspaceConfiguration>,
) {
  return {
    ...overrides,
  } as vscode.WorkspaceConfiguration;
}
