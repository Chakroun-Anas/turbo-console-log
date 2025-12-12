import * as vscode from 'vscode';
import { uncommentAllLogMessagesCommand } from '@/commands/uncommentAllLogMessages';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import {
  makeExtensionContext,
  makeDebugMessage,
} from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { DebugMessage } from '@/debug-message';
import { canInsertLogInDocument } from '@/helpers/canInsertLogInDocument';

jest.mock('@/helpers/canInsertLogInDocument');

describe('uncommentAllLogMessagesCommand', () => {
  let mockExtensionProperties: ExtensionProperties;
  let mockDebugMessage: DebugMessage;
  let mockContext: vscode.ExtensionContext;
  const mockCanInsertLogInDocument =
    canInsertLogInDocument as jest.MockedFunction<
      typeof canInsertLogInDocument
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCanInsertLogInDocument.mockReturnValue(true);

    mockExtensionProperties = {
      logFunction: 'log',
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

      const command = uncommentAllLogMessagesCommand();

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

    describe('basic uncommenting', () => {
      it('should uncomment a single commented log message', async () => {
        const mockLines = [
          'const myVar = 123;',
          '    // console.log("Debug ~ file.js:2 ~ myVar:", myVar);',
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(1, 0),
          '    console.log("Debug ~ file.js:2 ~ myVar:", myVar);\n',
        );
      });

      it('should uncomment multiple commented log messages', async () => {
        const mockLines = [
          'const var1 = 123;',
          '    // console.log("Debug ~ file.js:2 ~ var1:", var1);',
          'const var2 = 456;',
          '    // console.log("Debug ~ file.js:4 ~ var2:", var2);',
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange1],
            isCommented: true,
            isTurboConsoleLog: true,
          },
          {
            spaces: '    ',
            lines: [mockRange2],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange2);
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(1, 0),
          '    console.log("Debug ~ file.js:2 ~ var1:", var1);\n',
        );
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(3, 0),
          '    console.log("Debug ~ file.js:4 ~ var2:", var2);\n',
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(2);
        expect(mockEditBuilder.insert).toHaveBeenCalledTimes(2);
      });

      it('should handle multi-line commented log messages', async () => {
        const mockLines = [
          'const myVar = 123;',
          '    // console.log(',
          '    //   "Debug ~ file.js:2 ~ myVar:",',
          '    //   myVar',
          '    // );',
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '    ',
            lines: [mockRange1, mockRange2, mockRange3, mockRange4],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange2);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange3);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange4);
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(1, 0),
          '    console.log(\n',
        );
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(2, 0),
          '    "Debug ~ file.js:2 ~ myVar:",\n',
        );
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(3, 0),
          '    myVar\n',
        );
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(4, 0),
          '    );\n',
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(4);
        expect(mockEditBuilder.insert).toHaveBeenCalledTimes(4);
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).not.toHaveBeenCalled();
        expect(mockEditBuilder.insert).not.toHaveBeenCalled();
      });

      it('should handle commented log message at the beginning of file', async () => {
        const mockLines = [
          '// console.log("Debug ~ file.js:1 ~ myVar:", myVar);',
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '',
            lines: [mockRange],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(0, 0),
          'console.log("Debug ~ file.js:1 ~ myVar:", myVar);\n',
        );
      });

      it('should handle commented log message at the end of file', async () => {
        const mockLines = [
          'const myVar = 123;',
          '// console.log("Debug ~ file.js:2 ~ myVar:", myVar);',
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '',
            lines: [mockRange],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(1, 0),
          'console.log("Debug ~ file.js:2 ~ myVar:", myVar);\n',
        );
      });

      it('should handle different log types and functions', async () => {
        const mockLines = [
          'const myVar = 123;',
          '// console.error("Error ~ file.js:2 ~ myVar:", myVar);',
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '',
            lines: [mockRange],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        mockExtensionProperties.logFunction = 'error';

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockDebugMessage.detectAll).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          mockDocument.uri.fsPath,
          'error',
          'Debug',
          '~',
        );
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange);
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(1, 0),
          'console.error("Error ~ file.js:2 ~ myVar:", myVar);\n',
        );
      });
    });

    describe('realistic scenarios', () => {
      it('should handle uncommented log messages in a larger file with multiple functions', async () => {
        const mockLines = [
          'class UserService {',
          '  constructor(private apiClient: ApiClient) {}',
          '',
          '  async fetchUser(id: string): Promise<User> {',
          '    try {',
          '      const response = await this.apiClient.get(`/users/${id}`);',
          '      // console.log("Debug ~ UserService.ts:7 ~ fetchUser ~ response:", response);',
          '      return response.data;',
          '    } catch (error) {',
          '      console.error("Error fetching user:", error);',
          '      // console.log("Debug ~ UserService.ts:11 ~ fetchUser ~ error:", error);',
          '      throw new Error("Failed to fetch user");',
          '    }',
          '  }',
          '',
          '  async updateUser(id: string, data: Partial<User>): Promise<User> {',
          '    const payload = { ...data, updatedAt: new Date() };',
          '    // console.log("Debug ~ UserService.ts:18 ~ updateUser ~ payload:", payload);',
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

        // Commented log message at line 6 (index 6)
        const mockRange1 = new vscode.Range(
          new vscode.Position(6, 0),
          new vscode.Position(6, mockLines[6].length),
        );

        // Commented log message at line 10 (index 10)
        const mockRange2 = new vscode.Range(
          new vscode.Position(10, 0),
          new vscode.Position(10, mockLines[10].length),
        );

        // Commented log message at line 17 (index 17)
        const mockRange3 = new vscode.Range(
          new vscode.Position(17, 0),
          new vscode.Position(17, mockLines[17].length),
        );

        mockEditor = makeTextEditor({
          document: mockDocument,
          selections: [],
        });

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([
          {
            spaces: '      ',
            lines: [mockRange1],
            isCommented: true,
            isTurboConsoleLog: true,
          },
          {
            spaces: '      ',
            lines: [mockRange2],
            isCommented: true,
            isTurboConsoleLog: true,
          },
          {
            spaces: '    ',
            lines: [mockRange3],
            isCommented: true,
            isTurboConsoleLog: true,
          },
        ]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        // Verify all commented log messages are deleted
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange1);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange2);
        expect(mockEditBuilder.delete).toHaveBeenCalledWith(mockRange3);

        // Verify all uncommented versions are inserted
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(6, 0),
          '      console.log("Debug ~ UserService.ts:7 ~ fetchUser ~ response:", response);\n',
        );
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(10, 0),
          '      console.log("Debug ~ UserService.ts:11 ~ fetchUser ~ error:", error);\n',
        );
        expect(mockEditBuilder.insert).toHaveBeenCalledWith(
          new vscode.Position(17, 0),
          '    console.log("Debug ~ UserService.ts:18 ~ updateUser ~ payload:", payload);\n',
        );

        // Total: 3 deletes + 3 inserts = 6 edit operations
        expect(mockEditBuilder.delete).toHaveBeenCalledTimes(3);
        expect(mockEditBuilder.insert).toHaveBeenCalledTimes(3);
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

        mockDebugMessage.detectAll = jest.fn().mockResolvedValue([]);

        vscode.window.activeTextEditor = mockEditor;

        mockEditor.edit = jest.fn().mockImplementation((cb) => {
          cb(mockEditBuilder);
          return Promise.resolve(true);
        });

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockDebugMessage.detectAll).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          mockDocument.uri.fsPath,
          'log',
          'Debug',
          '~',
        );
      });

      it('should call debugMessage.detectAll with args when provided', async () => {
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

        const command = uncommentAllLogMessagesCommand();

        await command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
        });

        expect(mockDebugMessage.detectAll).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          mockDocument.uri.fsPath,
          'log',
          'Debug',
          '~',
        );
      });
    });
  });

  describe('command registration', () => {
    it('should return correct command name', () => {
      const command = uncommentAllLogMessagesCommand();
      expect(command.name).toBe('turboConsoleLog.uncommentAllLogMessages');
    });

    it('should have a handler function', () => {
      const command = uncommentAllLogMessagesCommand();
      expect(typeof command.handler).toBe('function');
    });
  });

  describe('PHP Pro-only blocking', () => {
    it('should not uncomment logs when canInsertLogInDocument returns false', async () => {
      mockCanInsertLogInDocument.mockReturnValue(false);

      const mockDocument = makeTextDocument(
        ['<?php // var_dump($var);'],
        'test.php',
        'php',
      );

      const mockEditor = makeTextEditor({
        document: mockDocument,
        selections: [],
      });

      vscode.window.activeTextEditor = mockEditor;

      mockDebugMessage.detectAll = jest.fn().mockReturnValue([]);

      const command = uncommentAllLogMessagesCommand();

      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(mockDebugMessage.detectAll).not.toHaveBeenCalled();
    });

    it('should uncomment logs when canInsertLogInDocument returns true', async () => {
      mockCanInsertLogInDocument.mockReturnValue(true);

      const mockDocument = makeTextDocument(['// console.log("test");']);

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

      mockDebugMessage.detectAll = jest.fn().mockReturnValue([]);

      const command = uncommentAllLogMessagesCommand();

      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(mockCanInsertLogInDocument).toHaveBeenCalled();
      expect(mockDebugMessage.detectAll).toHaveBeenCalled();
    });
  });
});
