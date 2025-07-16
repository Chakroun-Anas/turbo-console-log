export const window = {
  showInformationMessage: jest.fn(),
  registerWebviewViewProvider: jest.fn(),
  showErrorMessage: jest.fn(),
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
