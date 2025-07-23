// jest-tests/mocks/helpers/makeExtensionContext.ts
import * as vscode from 'vscode';

export const makeExtensionContext = (
  overrides: Partial<vscode.ExtensionContext> = {},
): vscode.ExtensionContext => {
  return {
    subscriptions: [],
    globalState: {
      get: jest.fn(),
      update: jest.fn(),
    },
    workspaceState: {
      get: jest.fn(),
      update: jest.fn(),
    },
    // extensionUri: vscode.Uri.parse('file:///mock'),
    extensionPath: '/mock',
    asAbsolutePath: jest.fn((path: string) => `/mock/${path}`),
    ...overrides,
  } as vscode.ExtensionContext;
};
