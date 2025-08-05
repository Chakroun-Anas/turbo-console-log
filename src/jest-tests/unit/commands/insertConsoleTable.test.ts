import * as vscode from 'vscode';
import { insertConsoleTableCommand } from '@/commands/insertConsoleTable';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { ExtensionProperties } from '@/entities';
import {
  makeDebugMessage,
  makeExtensionContext,
} from '@/jest-tests/mocks/helpers';

jest.mock('@/utilities', () => ({
  getTabSize: () => 2,
}));

describe('insertConsoleTableCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    vscode.window.activeTextEditor = undefined;
  });

  it('should not throw or call debugMessage.msg when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined; // simulate no open editor

    const debugMessage = makeDebugMessage();

    const command = insertConsoleTableCommand();

    await expect(
      command.handler({
        context: makeExtensionContext(),
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      }),
    ).resolves.not.toThrow();

    expect(debugMessage.msg).not.toHaveBeenCalled();
  });

  it('should call debugMessage.msg with correct parameters and table log type', async () => {
    const mockDocument = makeTextDocument(['const myVar = 42;']);

    const mockSelection = new vscode.Selection(
      new vscode.Position(0, 6),
      new vscode.Position(0, 11),
    );

    const mockEditBuilder = createMockTextEditorEdit();

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [mockSelection],
    });

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    vscode.window.activeTextEditor = mockEditor;

    const debugMessage = makeDebugMessage();

    const command = insertConsoleTableCommand();

    await command.handler({
      context: makeExtensionContext(),
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(debugMessage.msg).toHaveBeenCalledWith(
      mockEditBuilder,
      mockDocument,
      'myVar',
      0,
      2,
      {},
      'table',
    );
  });

  it('should not call debugMessage.msg when nothing is selected and no word under cursor', async () => {
    const mockDocument = makeTextDocument(['']); // line with only spaces

    const emptySelection = new vscode.Selection(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0),
    );

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [emptySelection],
    });

    const mockEditBuilder = createMockTextEditorEdit();

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    vscode.window.activeTextEditor = mockEditor;

    const debugMessage = makeDebugMessage();

    const command = insertConsoleTableCommand();

    await command.handler({
      context: makeExtensionContext(),
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(debugMessage.msg).not.toHaveBeenCalled(); // no selected var to log
  });

  it('should handle multiple selections', async () => {
    const mockDocument = makeTextDocument([
      'const firstVar = 42;',
      'const secondVar = "hello";',
    ]);

    const firstSelection = new vscode.Selection(
      new vscode.Position(0, 6),
      new vscode.Position(0, 14),
    );

    const secondSelection = new vscode.Selection(
      new vscode.Position(1, 6),
      new vscode.Position(1, 15),
    );

    const mockEditBuilder = createMockTextEditorEdit();

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [firstSelection, secondSelection],
    });

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    vscode.window.activeTextEditor = mockEditor;

    const debugMessage = makeDebugMessage();

    const command = insertConsoleTableCommand();

    await command.handler({
      context: makeExtensionContext(),
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(debugMessage.msg).toHaveBeenCalledTimes(2);
    expect(debugMessage.msg).toHaveBeenNthCalledWith(
      1,
      mockEditBuilder,
      mockDocument,
      'firstVar',
      0,
      2,
      {},
      'table',
    );
    expect(debugMessage.msg).toHaveBeenNthCalledWith(
      2,
      mockEditBuilder,
      mockDocument,
      'secondVar',
      1,
      2,
      {},
      'table',
    );
  });

  it('should use word under cursor when no text is selected', async () => {
    const mockDocument = makeTextDocument(['const myVariable = 123;']);

    // Mock getWordRangeAtPosition to return a range for 'myVariable'
    mockDocument.getWordRangeAtPosition = jest
      .fn()
      .mockReturnValue(
        new vscode.Range(new vscode.Position(0, 6), new vscode.Position(0, 16)),
      );

    const cursorSelection = new vscode.Selection(
      new vscode.Position(0, 8), // cursor in middle of 'myVariable'
      new vscode.Position(0, 8),
    );

    const mockEditBuilder = createMockTextEditorEdit();

    const mockEditor = makeTextEditor({
      document: mockDocument,
      selections: [cursorSelection],
    });

    mockEditor.edit = jest.fn().mockImplementation((cb) => {
      cb(mockEditBuilder);
      return Promise.resolve(true);
    });

    vscode.window.activeTextEditor = mockEditor;

    const debugMessage = makeDebugMessage();

    const command = insertConsoleTableCommand();

    await command.handler({
      context: makeExtensionContext(),
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(debugMessage.msg).toHaveBeenCalledWith(
      mockEditBuilder,
      mockDocument,
      'myVariable',
      0,
      2,
      {},
      'table',
    );
  });
});
