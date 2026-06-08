import * as vscode from 'vscode';
import { commentAllLogMessagesCommand } from '@/commands/commentAllLogMessages';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import {
  makeExtensionContext,
  makeDebugMessage,
} from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { resolveDebugRuntime } from '@/helpers/resolveDebugRuntime';

jest.mock('@/helpers/resolveDebugRuntime', () => {
  const actual = jest.requireActual('@/helpers/resolveDebugRuntime');
  return { ...actual, resolveDebugRuntime: jest.fn() };
});

const mockResolveDebugRuntime = resolveDebugRuntime as jest.MockedFunction<
  typeof resolveDebugRuntime
>;

describe('commentAllLogMessagesCommand', () => {
  let debugMessage: ReturnType<typeof makeDebugMessage>;

  beforeEach(() => {
    jest.clearAllMocks();
    debugMessage = makeDebugMessage();
    mockResolveDebugRuntime.mockReturnValue({
      language: 'javascript',
      commentPrefix: '//',
      debugMessage,
    });
  });

  it('should not throw or call debugMessage.detectAll when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined; // simulate no open editor

    const command = commentAllLogMessagesCommand();

    await expect(
      command.handler({
        context: makeExtensionContext(),
        extensionProperties: {} as ExtensionProperties,
      }),
    ).resolves.not.toThrow();

    expect(debugMessage.detectAll).not.toHaveBeenCalled();
  });
  it('should delete and reinsert all log lines as comments', async () => {
    const mockLines = ['    console.log("Debug myVar:", myVar);'];
    const mockDocument = makeTextDocument(mockLines);

    const mockRange = new vscode.Range(
      new vscode.Position(0, 4),
      new vscode.Position(0, mockLines[0].length),
    );

    const mockEditBuilder = createMockTextEditorEdit();

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [],
    });

    const extensionContext = makeExtensionContext();
    debugMessage.detectAll = jest.fn().mockReturnValue([
      {
        spaces: '    ',
        lines: [mockRange],
        isTurboConsoleLog: true,
      },
    ]);

    vscode.window.activeTextEditor = mockEditor;

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    const command = commentAllLogMessagesCommand();

    await command.handler({
      context: extensionContext,
      extensionProperties: {
        logFunction: 'log',
        logMessagePrefix: 'Debug',
        delimiterInsideMessage: ':',
      } as ExtensionProperties,
    });

    expect(debugMessage.detectAll).toHaveBeenCalled();

    expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(
      new vscode.Position(0, 0),
      `    // console.log("Debug myVar:", myVar);\n`,
    );
  });

  it('should skip already commented log lines', async () => {
    const mockLines = ['    // console.log("Debug myVar:", myVar);'];
    const mockDocument = makeTextDocument(mockLines);

    const mockRange = new vscode.Range(
      new vscode.Position(0, 7), // Range starts AFTER the //
      new vscode.Position(0, mockLines[0].length),
    );

    const mockEditBuilder = createMockTextEditorEdit();

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [],
    });

    const extensionContext = makeExtensionContext();
    // Simulate detectAll finding a commented log (which it actually does)
    debugMessage.detectAll = jest.fn().mockReturnValue([
      {
        spaces: '    ',
        lines: [mockRange],
        isTurboConsoleLog: true,
        isCommented: true, // This is what detectAll returns for commented logs
      },
    ]);

    vscode.window.activeTextEditor = mockEditor;

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    const command = commentAllLogMessagesCommand();

    await command.handler({
      context: extensionContext,
      extensionProperties: {
        logFunction: 'log',
        logMessagePrefix: 'Debug',
        delimiterInsideMessage: ':',
      } as ExtensionProperties,
    });

    expect(debugMessage.detectAll).toHaveBeenCalled();

    // The handler should NOT process already commented logs at all
    expect(mockEditBuilder.delete).not.toHaveBeenCalled();
    expect(mockEditBuilder.insert).not.toHaveBeenCalled();
  });

  it('should handle mixed commented and uncommented logs correctly', async () => {
    const mockLines = [
      'console.log("Debug myVar:", myVar);',
      '// console.log("Debug otherVar:", otherVar);',
    ];
    const mockDocument = makeTextDocument(mockLines);

    const mockRange1 = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, mockLines[0].length),
    );

    const mockRange2 = new vscode.Range(
      new vscode.Position(1, 3),
      new vscode.Position(1, mockLines[1].length),
    );

    const mockEditBuilder = createMockTextEditorEdit();

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [],
    });

    const extensionContext = makeExtensionContext();
    debugMessage.detectAll = jest.fn().mockReturnValue([
      {
        spaces: '',
        lines: [mockRange1],
        isTurboConsoleLog: true,
        isCommented: false, // Uncommented log
      },
      {
        spaces: '',
        lines: [mockRange2],
        isTurboConsoleLog: true,
        isCommented: true, // Commented log
      },
    ]);

    vscode.window.activeTextEditor = mockEditor;

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    const command = commentAllLogMessagesCommand();

    await command.handler({
      context: extensionContext,
      extensionProperties: {
        logFunction: 'log',
        logMessagePrefix: 'Debug',
        delimiterInsideMessage: ':',
      } as ExtensionProperties,
    });

    expect(debugMessage.detectAll).toHaveBeenCalled();

    // Should only process the uncommented log
    expect(mockEditBuilder.delete).toHaveBeenCalledTimes(1);
    expect(mockEditBuilder.insert).toHaveBeenCalledTimes(1);

    expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(
      new vscode.Position(0, 0),
      `// console.log("Debug myVar:", myVar);\n`,
    );
  });
});
