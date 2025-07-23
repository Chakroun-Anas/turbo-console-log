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

describe('commentAllLogMessagesCommand', () => {
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
        logType: 'log',
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
});
