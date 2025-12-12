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
import { loadPhpDebugMessage } from '@/helpers/loadPhpDebugMessage';
import { canInsertLogInDocument } from '@/helpers/canInsertLogInDocument';

jest.mock('@/helpers/loadPhpDebugMessage');
jest.mock('@/helpers/canInsertLogInDocument');

describe('commentAllLogMessagesCommand', () => {
  const mockLoadPhpDebugMessage = loadPhpDebugMessage as jest.MockedFunction<
    typeof loadPhpDebugMessage
  >;
  const mockCanInsertLogInDocument =
    canInsertLogInDocument as jest.MockedFunction<
      typeof canInsertLogInDocument
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPhpDebugMessage.mockResolvedValue(null);
    mockCanInsertLogInDocument.mockReturnValue(true);
  });

  it('should not throw or call debugMessage.detectAll when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined; // simulate no open editor

    const debugMessage = makeDebugMessage();

    const command = commentAllLogMessagesCommand();

    await expect(
      command.handler({
        context: makeExtensionContext(),
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
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

    const debugMessage = makeDebugMessage();
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
      debugMessage,
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

    const debugMessage = makeDebugMessage();
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
      debugMessage,
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

    const debugMessage = makeDebugMessage();
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
      debugMessage,
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

  describe('PHP Pro bundle integration', () => {
    it('should use PHP debug message for PHP files', async () => {
      const phpDebugMessage = makeDebugMessage();
      const mockRange = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 20),
      );

      phpDebugMessage.detectAll = jest.fn().mockReturnValue([
        {
          spaces: '',
          lines: [mockRange],
          isTurboConsoleLog: true,
          isCommented: false,
        },
      ]);

      mockLoadPhpDebugMessage.mockResolvedValue(phpDebugMessage);

      const mockDocument = makeTextDocument(
        ['<?php var_dump($var);'],
        'test.php',
        'php',
      );

      const mockEditBuilder = createMockTextEditorEdit();

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [],
      });

      mockEditor.edit = jest.fn().mockImplementation((cb) => {
        cb(mockEditBuilder);
        return Promise.resolve(true);
      });

      vscode.window.activeTextEditor = mockEditor;

      const jsDebugMessage = makeDebugMessage();
      const context = makeExtensionContext();

      const command = commentAllLogMessagesCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage: jsDebugMessage,
      });

      expect(mockLoadPhpDebugMessage).toHaveBeenCalledWith(context);
      expect(phpDebugMessage.detectAll).toHaveBeenCalled();
      expect(jsDebugMessage.detectAll).not.toHaveBeenCalled();
    });

    it('should show error when PHP debug message fails to load', async () => {
      mockLoadPhpDebugMessage.mockResolvedValue(null);

      const mockDocument = makeTextDocument(
        ['<?php var_dump($var);'],
        'test.php',
        'php',
      );

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [],
      });

      vscode.window.activeTextEditor = mockEditor;

      const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');

      const debugMessage = makeDebugMessage();
      const context = makeExtensionContext();

      const command = commentAllLogMessagesCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Failed to load PHP support from Pro bundle.',
      );
      expect(debugMessage.detectAll).not.toHaveBeenCalled();
    });

    it('should not load PHP debug message for non-PHP files', async () => {
      const mockDocument = makeTextDocument(
        ['console.log("test");'],
        'test.js',
        'javascript',
      );

      const mockEditBuilder = createMockTextEditorEdit();

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [],
      });

      mockEditor.edit = jest.fn().mockImplementation((cb) => {
        cb(mockEditBuilder);
        return Promise.resolve(true);
      });

      const debugMessage = makeDebugMessage();
      debugMessage.detectAll = jest.fn().mockReturnValue([]);

      vscode.window.activeTextEditor = mockEditor;

      const context = makeExtensionContext();

      const command = commentAllLogMessagesCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockLoadPhpDebugMessage).not.toHaveBeenCalled();
      expect(debugMessage.detectAll).toHaveBeenCalled();
    });
  });

  describe('PHP Pro-only blocking', () => {
    it('should not comment logs when canInsertLogInDocument returns false', async () => {
      mockCanInsertLogInDocument.mockReturnValue(false);

      const mockDocument = makeTextDocument(
        ['<?php var_dump($var);'],
        'test.php',
        'php',
      );

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [],
      });

      vscode.window.activeTextEditor = mockEditor;

      const debugMessage = makeDebugMessage();
      debugMessage.detectAll = jest.fn().mockReturnValue([]);

      const context = makeExtensionContext();

      const command = commentAllLogMessagesCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(mockLoadPhpDebugMessage).not.toHaveBeenCalled();
      expect(debugMessage.detectAll).not.toHaveBeenCalled();
    });

    it('should comment logs when canInsertLogInDocument returns true', async () => {
      mockCanInsertLogInDocument.mockReturnValue(true);

      const mockDocument = makeTextDocument(['console.log("test");']);

      const mockEditBuilder = createMockTextEditorEdit();

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [],
      });

      mockEditor.edit = jest.fn().mockImplementation((cb) => {
        cb(mockEditBuilder);
        return Promise.resolve(true);
      });

      vscode.window.activeTextEditor = mockEditor;

      const debugMessage = makeDebugMessage();
      debugMessage.detectAll = jest.fn().mockReturnValue([]);

      const context = makeExtensionContext();

      const command = commentAllLogMessagesCommand();

      await command.handler({
        context,
        extensionProperties: {} as ExtensionProperties,
        debugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(debugMessage.detectAll).toHaveBeenCalled();
    });
  });
});
