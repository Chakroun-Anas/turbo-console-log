import * as vscode from 'vscode';
import { displayLogMessageCommand } from '@/commands/displayLogMessage';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { ExtensionProperties } from '@/entities';
import {
  makeDebugMessage,
  makeExtensionContext,
} from '@/jest-tests/mocks/helpers';
import { trackLogInsertions } from '@/helpers/trackLogInsertions';

jest.mock('@/utilities', () => ({
  getTabSize: () => 2,
}));

jest.mock('@/helpers/trackLogInsertions', () => ({
  trackLogInsertions: jest.fn(),
}));

describe('displayLogMessageCommand', () => {
  const mockTrackNewUserJourney = trackLogInsertions as jest.MockedFunction<
    typeof trackLogInsertions
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    vscode.window.activeTextEditor = undefined;
  });

  it('should not throw or call debugMessage.msg when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined; // simulate no open editor

    const debugMessage = makeDebugMessage();

    const command = displayLogMessageCommand();

    await expect(
      command.handler({
        context: makeExtensionContext(),
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      }),
    ).resolves.not.toThrow();

    expect(debugMessage.msg).not.toHaveBeenCalled();
  });

  it('should call debugMessage.msg with correct parameters', async () => {
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

    const command = displayLogMessageCommand();

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
      'log',
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

    const command = displayLogMessageCommand();

    await command.handler({
      context: makeExtensionContext(),
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(debugMessage.msg).not.toHaveBeenCalled(); // no selected var to log
  });

  it('should call trackNewUserJourney after successful log insertion', async () => {
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
    const context = makeExtensionContext();

    const command = displayLogMessageCommand();

    await command.handler({
      context,
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(mockTrackNewUserJourney).toHaveBeenCalledWith(context);
  });

  it('should not call trackNewUserJourney when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined;

    const debugMessage = makeDebugMessage();
    const context = makeExtensionContext();

    const command = displayLogMessageCommand();

    await command.handler({
      context,
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(mockTrackNewUserJourney).not.toHaveBeenCalled();
  });
});
