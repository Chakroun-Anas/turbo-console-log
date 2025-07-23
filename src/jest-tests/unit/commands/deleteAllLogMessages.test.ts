import * as vscode from 'vscode';
import { deleteAllLogMessagesCommand } from '@/commands/deleteAllLogMessages';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import {
  makeExtensionContext,
  makeDebugMessage,
} from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { LogType } from '@/entities/extension/extensionProperties';
import { DebugMessage } from '@/debug-message';

describe('deleteAllLogMessagesCommand', () => {
  let mockExtensionProperties: ExtensionProperties;
  let mockDebugMessage: DebugMessage;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExtensionProperties = {
      logFunction: 'log',
      logType: 'log',
      logMessagePrefix: 'Debug',
      delimiterInsideMessage: '~',
      includeFilename: true,
      includeLineNum: true,
    } as ExtensionProperties;

    mockDebugMessage = makeDebugMessage();
    mockContext = makeExtensionContext();
  });

  describe('when no editor is active', () => {
    it('should not throw or call debugMessage.detectAll', async () => {
      vscode.window.activeTextEditor = undefined;

      const command = deleteAllLogMessagesCommand();

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

    describe('basic deletion', () => {
      it('should delete a single log message', async () => {
        const mockLines = [
          'const myVar = 123;',
          'console.log("Debug ~ file.js:2 ~ myVar:", myVar);',
          'return myVar;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
      });

      it('should delete multiple log messages', async () => {
        const mockLines = [
          'const var1 = 123;',
          'console.log("Debug ~ file.js:2 ~ var1:", var1);',
          'const var2 = 456;',
          'console.log("Debug ~ file.js:4 ~ var2:", var2);',
          'return var1 + var2;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange1 = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );
        const mockRange2 = new vscode.Range(
          new vscode.Position(3, 0),
          new vscode.Position(3, mockLines[3].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange2);
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(2);
      });

      it('should handle multi-line log messages', async () => {
        const mockLines = [
          'const myVar = 123;',
          'console.log(',
          '  "Debug ~ file.js:2 ~ myVar:",',
          '  myVar',
          ');',
          'return myVar;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange1 = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );
        const mockRange2 = new vscode.Range(
          new vscode.Position(2, 0),
          new vscode.Position(2, mockLines[2].length),
        );
        const mockRange3 = new vscode.Range(
          new vscode.Position(3, 0),
          new vscode.Position(3, mockLines[3].length),
        );
        const mockRange4 = new vscode.Range(
          new vscode.Position(4, 0),
          new vscode.Position(4, mockLines[4].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
          {
            spaces: '    ',
            lines: [mockRange1, mockRange2, mockRange3, mockRange4],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange2);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange3);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange4);
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(4);
      });
    });

    describe('empty line handling', () => {
      it('should delete empty line before log message when present', async () => {
        const mockLines = [
          'const myVar = 123;',
          '', // empty line before
          'console.log("Debug ~ file.js:3 ~ myVar:", myVar);',
          'return myVar;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(2, 0),
          new vscode.Position(2, mockLines[2].length),
        );

        const mockLineBeforeRange = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, 0),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockLineBeforeRange,
        );
      });

      it('should delete empty line after log message when present', async () => {
        const mockLines = [
          'const myVar = 123;',
          'console.log("Debug ~ file.js:2 ~ myVar:", myVar);',
          '', // empty line after
          'return myVar;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );

        const mockLineAfterRange = new vscode.Range(
          new vscode.Position(2, 0),
          new vscode.Position(2, 0),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockLineAfterRange);
      });

      it('should delete empty lines both before and after log message when present', async () => {
        const mockLines = [
          'const myVar = 123;',
          '', // empty line before
          'console.log("Debug ~ file.js:3 ~ myVar:", myVar);',
          '', // empty line after
          'return myVar;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(2, 0),
          new vscode.Position(2, mockLines[2].length),
        );

        const mockLineBeforeRange = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, 0),
        );

        const mockLineAfterRange = new vscode.Range(
          new vscode.Position(3, 0),
          new vscode.Position(3, 0),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockLineBeforeRange,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockLineAfterRange);
      });

      it('should not delete non-empty lines before and after log message', async () => {
        const mockLines = [
          'const myVar = 123;',
          'console.log("Debug ~ file.js:2 ~ myVar:", myVar);',
          'return myVar;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(1);
      });

      it('should handle empty lines in a larger file with multiple functions and log messages', async () => {
        const mockLines = [
          'class UserService {',
          '  constructor(private apiClient: ApiClient) {}',
          '',
          '  async fetchUser(id: string): Promise<User> {',
          '    try {',
          '      const response = await this.apiClient.get(`/users/${id}`);',
          '',
          '      console.log("Debug ~ UserService.ts:7 ~ fetchUser ~ response:", response);',
          '',
          '      return response.data;',
          '    } catch (error) {',
          '      console.error("Error fetching user:", error);',
          '',
          '      console.log("Debug ~ UserService.ts:12 ~ fetchUser ~ error:", error);',
          '',
          '      throw new Error("Failed to fetch user");',
          '    }',
          '  }',
          '',
          '  async updateUser(id: string, data: Partial<User>): Promise<User> {',
          '    const payload = { ...data, updatedAt: new Date() };',
          '',
          '    console.log("Debug ~ UserService.ts:21 ~ updateUser ~ payload:", payload);',
          '',
          '    const response = await this.apiClient.put(`/users/${id}`, payload);',
          '    return response.data;',
          '  }',
          '',
          '  private validateUserData(data: any): boolean {',
          '    if (!data.email || !data.name) {',
          '      return false;',
          '    }',
          '    return true;',
          '  }',
          '}',
        ];
        mockDocument = makeTextDocument(mockLines, 'UserService.ts');

        // Log message at line 7 (index 7)
        const mockRange1 = new vscode.Range(
          new vscode.Position(7, 0),
          new vscode.Position(7, mockLines[7].length),
        );

        // Log message at line 13 (index 13)
        const mockRange2 = new vscode.Range(
          new vscode.Position(13, 0),
          new vscode.Position(13, mockLines[13].length),
        );

        // Log message at line 22 (index 22)
        const mockRange3 = new vscode.Range(
          new vscode.Position(22, 0),
          new vscode.Position(22, mockLines[22].length),
        );

        // Empty line before first log (line 6, index 6)
        const mockEmptyLineBefore1 = new vscode.Range(
          new vscode.Position(6, 0),
          new vscode.Position(6, 0),
        );

        // Empty line after first log (line 8, index 8)
        const mockEmptyLineAfter1 = new vscode.Range(
          new vscode.Position(8, 0),
          new vscode.Position(8, 0),
        );

        // Empty line before second log (line 12, index 12)
        const mockEmptyLineBefore2 = new vscode.Range(
          new vscode.Position(12, 0),
          new vscode.Position(12, 0),
        );

        // Empty line after second log (line 14, index 14)
        const mockEmptyLineAfter2 = new vscode.Range(
          new vscode.Position(14, 0),
          new vscode.Position(14, 0),
        );

        // Empty line before third log (line 21, index 21)
        const mockEmptyLineBefore3 = new vscode.Range(
          new vscode.Position(21, 0),
          new vscode.Position(21, 0),
        );

        // Empty line after third log (line 23, index 23)
        const mockEmptyLineAfter3 = new vscode.Range(
          new vscode.Position(23, 0),
          new vscode.Position(23, 0),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
          {
            spaces: '      ',
            lines: [mockRange1],
          },
          {
            spaces: '      ',
            lines: [mockRange2],
          },
          {
            spaces: '    ',
            lines: [mockRange3],
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        // Verify all log messages are deleted
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange2);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange3);

        // Verify all empty lines before and after log messages are deleted
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockEmptyLineBefore1,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockEmptyLineAfter1,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockEmptyLineBefore2,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockEmptyLineAfter2,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockEmptyLineBefore3,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(
          mockEmptyLineAfter3,
        );

        // Total: 3 log messages + 6 empty lines = 9 delete calls
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(9);
      });
    });

    describe('edge cases', () => {
      it('should handle empty log messages array', async () => {
        const mockLines = ['const myVar = 123;'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).not.toHaveBeenCalled();
      });

      it('should handle log message at the beginning of file', async () => {
        const mockLines = [
          'console.log("Debug ~ file.js:1 ~ myVar:", myVar);',
          'const myVar = 123;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
      });

      it('should handle log message at the end of file', async () => {
        const mockLines = [
          'const myVar = 123;',
          'console.log("Debug ~ file.js:2 ~ myVar:", myVar);',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(1, 0),
          new vscode.Position(1, mockLines[1].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
      });

      it('should handle different log types and functions', async () => {
        const mockLines = [
          'console.error("Error ~ file.js:1 ~ myVar:", myVar);',
          'const myVar = 123;',
        ];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        const mockRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, mockLines[0].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([
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

        mockExtensionProperties.logFunction = 'error';
        mockExtensionProperties.logType = LogType.error;

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockDebugMessage.detectAll).toHaveBeenCalledWith(
          mockDocument,
          'error',
          'error',
          'Debug',
          '~',
          undefined,
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
      });
    });

    describe('debugMessage.detectAll integration', () => {
      it('should call debugMessage.detectAll with correct parameters', async () => {
        const mockLines = ['const myVar = 123;'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = deleteAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockDebugMessage.detectAll).toHaveBeenCalledWith(
          mockDocument,
          'log',
          'log',
          'Debug',
          '~',
          undefined,
        );
      });

      it('should call debugMessage.detectAll with args when provided', async () => {
        const mockLines = ['const myVar = 123;'];
        mockDocument = makeTextDocument(mockLines, 'file.js');

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockReturnValue([]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = deleteAllLogMessagesCommand();
        const mockArgs: unknown[] = ['someArg', 'value'];

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
          args: mockArgs,
        });

        expect(mockDebugMessage.detectAll).toHaveBeenCalledWith(
          mockDocument,
          'log',
          'log',
          'Debug',
          '~',
          mockArgs,
        );
      });
    });
  });

  describe('command registration', () => {
    it('should return correct command name', () => {
      const command = deleteAllLogMessagesCommand();
      expect(command.name).toBe('turboConsoleLog.deleteAllLogMessages');
    });

    it('should have a handler function', () => {
      const command = deleteAllLogMessagesCommand();
      expect(typeof command.handler).toBe('function');
    });
  });
});
