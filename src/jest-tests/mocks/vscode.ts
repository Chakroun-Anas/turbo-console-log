export const window = {
  showInformationMessage: jest.fn(),
  registerWebviewViewProvider: jest.fn(),
  registerTreeDataProvider: jest.fn(),
  registerFileDecorationProvider: jest.fn(),
  showErrorMessage: jest.fn(),
  showInputBox: jest.fn(),
  showWarningMessage: jest.fn(),
  withProgress: jest.fn((_opts, cb) => cb({ report: jest.fn() })),
  createTreeView: jest.fn(() => ({
    visible: false,
    onDidChangeVisibility: jest.fn(),
    onDidChangeCheckboxState: jest.fn(),
  })),
  createStatusBarItem: jest.fn(() => ({
    text: '',
    tooltip: '',
    command: '',
    backgroundColor: null,
    show: jest.fn(),
    hide: jest.fn(),
  })),
};

export const ProgressLocation = {
  Notification: 'Notification',
};

export const ViewColumn = {
  Active: -1,
  Beside: -2,
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn(() => true), // Default to telemetry enabled for tests
  })),
  onDidChangeConfiguration: jest.fn(),
  openTextDocument: jest.fn(),
};

export const extensions = {
  getExtension: jest.fn(() => ({ packageJSON: { version: '3.0.0' } })),
};

export const env = {
  isTelemetryEnabled: true,
  machineId: 'test-machine-id',
  language: 'en',
  openExternal: jest.fn(),
};

export const Uri = {
  parse: jest.fn((uri: string) => uri),
  file: jest.fn((path: string) => ({ fsPath: path })),
};

export class Position {
  line: number;
  character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }
}

export class Range {
  start: Position;
  end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }

  isSingleLine(): boolean {
    return this.start.line === this.end.line;
  }

  contains(position: Position): boolean {
    const afterStart =
      position.line > this.start.line ||
      (position.line === this.start.line &&
        position.character >= this.start.character);

    const beforeEnd =
      position.line < this.end.line ||
      (position.line === this.end.line &&
        position.character <= this.end.character);

    return afterStart && beforeEnd;
  }
}

export class Selection extends Range {
  anchor: Position;
  active: Position;

  constructor(anchor: Position, active: Position) {
    super(anchor, active);
    this.anchor = anchor;
    this.active = active;
  }
}

export const version = '1.85.0';

export class EventEmitter<T> {
  event: jest.Mock;

  constructor() {
    this.event = jest.fn();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fire(_data?: T): void {
    // Mock implementation
  }

  dispose(): void {
    // Mock implementation
  }
}

export class ThemeIcon {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class TreeItem {
  label: string;
  iconPath?: ThemeIcon | string;

  constructor(label: string) {
    this.label = label;
  }
}
