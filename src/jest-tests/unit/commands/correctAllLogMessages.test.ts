import * as vscode from 'vscode';
import { correctAllLogMessagesCommand } from '@/commands/correctAllLogMessages';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import {
  makeExtensionContext,
  makeDebugMessage,
} from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { DebugMessage } from '@/debug-message';
import { showNotification } from '@/ui';

// Mock the UI module
jest.mock('@/ui');

describe('correctAllLogMessagesCommand', () => {
  let mockExtensionProperties: ExtensionProperties;
  let mockDebugMessage: DebugMessage;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExtensionProperties = {
      logFunction: 'log',
      logMessagePrefix: 'Debug',
      delimiterInsideMessage: '~',
      includeFilename: true,
      includeLineNum: true,
      logCorrectionNotificationEnabled: true,
    } as ExtensionProperties;

    mockDebugMessage = makeDebugMessage();
    mockContext = makeExtensionContext();
  });

  describe('when no editor is active', () => {
    it('should not throw or call debugMessage.detectAll', async () => {
      vscode.window.activeTextEditor = undefined;

      const command = correctAllLogMessagesCommand();

      await expect(
        command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        }),
      ).resolves.not.toThrow();

      expect(mockDebugMessage.detectAll).not.toHaveBeenCalled();
    });
  });

  describe('when editor is active', () => {
    let mockDocument: vscode.TextDocument;
    let mockEditor: vscode.TextEditor;
    let mockEditBuilder: ReturnType<typeof createMockTextEditorEdit>;

    beforeEach(() => {
      mockEditBuilder = createMockTextEditorEdit();
    });

    describe('filename correction', () => {
      it('should correct filename in log message when includeFilename is true', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js ~ myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).toHaveBeenCalledWith(
          mockRange,
          'console.log("Debug ~ newfile.js ~ myVar:", myVar);',
        );
      });

      it('should not correct filename when includeFilename is false', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js ~ myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        mockExtensionProperties.includeFilename = false;

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).not.toHaveBeenCalled();
      });
    });

    describe('line number correction', () => {
      it('should correct line number in log message when includeLineNum is true', async () => {
        const mockLines = ['console.log("Debug ~ file.js:5 ~ myVar:", myVar);'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).toHaveBeenCalledWith(
          mockRange,
          'console.log("Debug ~ file.js:1 ~ myVar:", myVar);',
        );
      });

      it('should not correct line number when includeLineNum is false', async () => {
        const mockLines = ['console.log("Debug ~ file.js:5 ~ myVar:", myVar);'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        mockExtensionProperties.includeLineNum = false;

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).not.toHaveBeenCalled();
      });
    });

    describe('combined corrections', () => {
      it('should correct both filename and line number', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js:5 ~ myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).toHaveBeenCalledWith(
          mockRange,
          'console.log("Debug ~ newfile.js:1 ~ myVar:", myVar);',
        );
      });

      it('should handle multiple log messages', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js:5 ~ var1:", var1);',
          'console.log("Debug ~ oldfile.js:10 ~ var2:", var2);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange1 = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );
        const mockRange2 = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange1],
          },
          {
            spaces: '    ',
            lines: [mockRange2],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).toHaveBeenCalledWith(
          mockRange1,
          'console.log("Debug ~ newfile.js:1 ~ var1:", var1);',
        );
        expect(mockEditBuilder.replace).toHaveBeenCalledWith(
          mockRange2,
          'console.log("Debug ~ newfile.js:2 ~ var2:", var2);',
        );
      });
    });

    describe('notifications', () => {
      it('should show notification for single correction when enabled', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js:5 ~ myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(showNotification).toHaveBeenCalledWith(
          '1 log message has been updated',
          5000,
        );
      });

      it('should show notification for multiple corrections when enabled', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js:5 ~ var1:", var1);',
          'console.log("Debug ~ oldfile.js:10 ~ var2:", var2);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange1 = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );
        const mockRange2 = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange1],
          },
          {
            spaces: '    ',
            lines: [mockRange2],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(showNotification).toHaveBeenCalledWith(
          '2 log messages have been updated',
          5000,
        );
      });

      it('should not show notification when disabled', async () => {
        const mockLines = [
          '    console.log("Debug~oldfile.js:5~myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'newfile.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 4),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        mockExtensionProperties.logCorrectionNotificationEnabled = false;

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(showNotification).not.toHaveBeenCalled();
      });

      it('should not show notification when no corrections are made', async () => {
        const mockLines = ['console.log("Debug ~ file.js:1 ~ myVar:", myVar);'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(showNotification).not.toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('should handle Windows file paths', async () => {
        const mockLines = [
          'console.log("Debug ~ oldfile.js:5 ~ myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'C:\\path\\to\\newfile.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).toHaveBeenCalledWith(
          mockRange,
          'console.log("Debug ~ newfile.js:1 ~ myVar:", myVar);',
        );
      });

      it('should handle empty log messages array', async () => {
        const mockLines = ['const myVar = 123;'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = correctAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.replace).not.toHaveBeenCalled();
        expect(showNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('command registration', () => {
    it('should return correct command name', () => {
      const command = correctAllLogMessagesCommand();
      expect(command.name).toBe('turboConsoleLog.correctAllLogMessages');
    });

    it('should have a handler function', () => {
      const command = correctAllLogMessagesCommand();
      expect(typeof command.handler).toBe('function');
    });
  });
});
