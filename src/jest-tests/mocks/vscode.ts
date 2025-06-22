export const window = {
  showInformationMessage: jest.fn(),
  registerWebviewViewProvider: jest.fn(),
  withProgress: jest.fn((_opts, cb) => cb({ report: jest.fn() })),
};

export const ProgressLocation = {
  Notification: 'Notification',
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const workspace = {
  getConfiguration: jest.fn(() => ({})),
};

export const extensions = {
  getExtension: jest.fn(() => ({ packageJSON: { version: '3.0.0' } })),
};
