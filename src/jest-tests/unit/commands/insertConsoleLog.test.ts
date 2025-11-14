import * as vscode from 'vscode';
import { insertConsoleLogCommand } from '@/commands/insertConsoleLog';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { ExtensionProperties } from '@/entities';
import {
  makeDebugMessage,
  makeExtensionContext,
} from '@/jest-tests/mocks/helpers';
import { trackLogInsertions } from '@/helpers/trackLogInsertions';
import { canInsertLogInDocument } from '@/helpers/canInsertLogInDocument';
import { loadPhpDebugMessage } from '@/helpers/loadPhpDebugMessage';

jest.mock('@/utilities', () => ({
  getTabSize: () => 2,
}));

jest.mock('@/helpers/trackLogInsertions', () => ({
  trackLogInsertions: jest.fn(),
}));

jest.mock('@/helpers/canInsertLogInDocument');

jest.mock('@/helpers/loadPhpDebugMessage');

describe('insertConsoleLogCommand', () => {
  const mockTrackNewUserJourney = trackLogInsertions as jest.MockedFunction<
    typeof trackLogInsertions
  >;
  const mockCanInsertLogInDocument =
    canInsertLogInDocument as jest.MockedFunction<
      typeof canInsertLogInDocument
    >;
  const mockLoadPhpDebugMessage = loadPhpDebugMessage as jest.MockedFunction<
    typeof loadPhpDebugMessage
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to allowing log insertion (JS/TS files or Pro user)
    mockCanInsertLogInDocument.mockReturnValue(true);
    // Default to null (not PHP or no Pro bundle)
    mockLoadPhpDebugMessage.mockResolvedValue(null);
  });

  afterEach(() => {
    vscode.window.activeTextEditor = undefined;
  });

  it('should not throw or call debugMessage.msg when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined; // simulate no open editor

    const debugMessage = makeDebugMessage();

    const command = insertConsoleLogCommand();

    await expect(
      command.handler({
        context: makeExtensionContext(),
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      }),
    ).resolves.not.toThrow();

    expect(debugMessage.msg).not.toHaveBeenCalled();
  });

  it('should call debugMessage.msg with correct parameters and log type', async () => {
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

    const command = insertConsoleLogCommand();

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

    const command = insertConsoleLogCommand();

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

    const command = insertConsoleLogCommand();

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
      'log',
    );
    expect(debugMessage.msg).toHaveBeenNthCalledWith(
      2,
      mockEditBuilder,
      mockDocument,
      'secondVar',
      1,
      2,
      {},
      'log',
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

    const command = insertConsoleLogCommand();

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
      'log',
    );
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

    const command = insertConsoleLogCommand();

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

    const command = insertConsoleLogCommand();

    await command.handler({
      context,
      extensionProperties: {} as ExtensionProperties,
      debugMessage,
    });

    expect(mockTrackNewUserJourney).not.toHaveBeenCalled();
  });

  describe('PHP Pro-only blocking', () => {
    it('should not insert log when canInsertLogInDocument returns false', async () => {
      mockCanInsertLogInDocument.mockReturnValue(false);

      const mockDocument = makeTextDocument(['$myVar = 42;']);

      const mockSelection = new vscode.Selection(
        new vscode.Position(0, 1),
        new vscode.Position(0, 7),
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

      const command = insertConsoleLogCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(debugMessage.msg).not.toHaveBeenCalled();
      expect(mockTrackNewUserJourney).not.toHaveBeenCalled();
    });

    it('should insert log when canInsertLogInDocument returns true (JS/TS or Pro user)', async () => {
      mockCanInsertLogInDocument.mockReturnValue(true);

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

      const command = insertConsoleLogCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(debugMessage.msg).toHaveBeenCalledWith(
        mockEditBuilder,
        mockDocument,
        'myVar',
        0,
        2,
        {},
        'log',
      );
      expect(mockTrackNewUserJourney).toHaveBeenCalledWith(context);
    });

    it('should check canInsertLogInDocument before processing multiple selections', async () => {
      mockCanInsertLogInDocument.mockReturnValue(false);

      const mockDocument = makeTextDocument([
        '$firstVar = 42;',
        '$secondVar = "hello";',
      ]);

      const firstSelection = new vscode.Selection(
        new vscode.Position(0, 1),
        new vscode.Position(0, 10),
      );

      const secondSelection = new vscode.Selection(
        new vscode.Position(1, 1),
        new vscode.Position(1, 11),
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
      const context = makeExtensionContext();

      const command = insertConsoleLogCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(debugMessage.msg).not.toHaveBeenCalled();
    });
  });

  describe('PHP Pro bundle integration', () => {
    it('should use PHP debug message and var_dump log type for PHP files', async () => {
      const phpDebugMessage = makeDebugMessage();
      mockLoadPhpDebugMessage.mockResolvedValue(phpDebugMessage);

      const mockDocument = makeTextDocument(
        ['<?php', '$myVar = 42;'],
        'test.php',
        'php',
      );

      const mockSelection = new vscode.Selection(
        new vscode.Position(1, 1),
        new vscode.Position(1, 6),
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

      const jsDebugMessage = makeDebugMessage();
      const context = makeExtensionContext();

      const command = insertConsoleLogCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage: jsDebugMessage,
      });

      expect(mockLoadPhpDebugMessage).toHaveBeenCalledWith(context);
      expect(phpDebugMessage.msg).toHaveBeenCalledWith(
        mockEditBuilder,
        mockDocument,
        'myVar',
        1,
        2,
        {},
        'var_dump',
      );
      expect(jsDebugMessage.msg).not.toHaveBeenCalled();
    });

    it('should show error and return when PHP debug message fails to load', async () => {
      mockLoadPhpDebugMessage.mockResolvedValue(null);

      const mockDocument = makeTextDocument(
        ['<?php', '$myVar = 42;'],
        'test.php',
        'php',
      );

      const mockSelection = new vscode.Selection(
        new vscode.Position(1, 1),
        new vscode.Position(1, 6),
      );

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [mockSelection],
      });

      vscode.window.activeTextEditor = mockEditor;

      const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');

      const debugMessage = makeDebugMessage();
      const context = makeExtensionContext();

      const command = insertConsoleLogCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockLoadPhpDebugMessage).toHaveBeenCalledWith(context);
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Failed to load PHP support from Pro bundle.',
      );
      expect(debugMessage.msg).not.toHaveBeenCalled();
    });

    it('should not load PHP debug message for non-PHP files', async () => {
      const mockDocument = makeTextDocument(
        ['const myVar = 42;'],
        'test.js',
        'javascript',
      );

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

      const command = insertConsoleLogCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockLoadPhpDebugMessage).not.toHaveBeenCalled();
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
  });
});
