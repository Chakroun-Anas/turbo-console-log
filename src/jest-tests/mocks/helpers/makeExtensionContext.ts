// jest-tests/mocks/helpers/makeExtensionContext.ts
import * as vscode from 'vscode';

export const makeExtensionContext = (
  overrides: Partial<vscode.ExtensionContext> = {},
): vscode.ExtensionContext => {
  const subscriptions: vscode.Disposable[] & { push: jest.Mock } =
    Object.assign([], {
      push: jest.fn((item: vscode.Disposable) => {
        return Array.prototype.push.call(subscriptions, item);
      }),
    });

  return {
    subscriptions,
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
