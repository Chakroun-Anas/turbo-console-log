import * as vscode from 'vscode';
import { DebugMessage } from './debug-message';
import { JSDebugMessage } from './debug-message/js';
import { ExtensionProperties, Message } from './entities';
import { LineCodeProcessing } from './line-code-processing';
import { JSLineCodeProcessing } from './line-code-processing/js';

export function activate(): void {
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  const jsDebugMessage: DebugMessage = new JSDebugMessage(jsLineCodeProcessing);
  // Insert debug message
  displayLogMessageCommand(jsDebugMessage);
  // Comment all debug messages
  commentAllLogMessagesCommand(jsDebugMessage);
  // Uncomment all debug messages
  uncommentAllLogMessagesCommand(jsDebugMessage);
  // Delete all debug messages
  deleteAllLogMessagesCommand(jsDebugMessage);
}

function displayLogMessageCommand(jsDebugMessage: DebugMessage) {
  vscode.commands.registerCommand(
    'turboConsoleLog.displayLogMessage',
    async () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration('turboConsoleLog');
      const properties: ExtensionProperties = getExtensionProperties(config);
      for (let index = 0; index < editor.selections.length; index++) {
        const selection: vscode.Selection = editor.selections[index];
        let wordUnderCursor = '';
        const rangeUnderCursor: vscode.Range | undefined =
          document.getWordRangeAtPosition(selection.active);
        // if rangeUnderCursor is undefined, `document.getText(undefined)` will return the entire file.
        if (rangeUnderCursor) {
          wordUnderCursor = document.getText(rangeUnderCursor);
        }
        const selectedVar: string =
          document.getText(selection) || wordUnderCursor;
        const lineOfSelectedVar: number = selection.active.line;
        if (selectedVar.trim().length !== 0) {
          await editor.edit((editBuilder) => {
            jsDebugMessage.msg(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              tabSize,
              properties,
            );
          });
        }
      }
    },
  );
}

function commentAllLogMessagesCommand(jsDebugMessage: DebugMessage) {
  vscode.commands.registerCommand(
    'turboConsoleLog.commentAllLogMessages',
    () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration('turboConsoleLog');
      const properties: ExtensionProperties = getExtensionProperties(config);
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        properties.delimiterInsideMessage,
        properties.quote,
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}// ${document.getText(line).trim()}\n`,
            );
          });
        });
      });
    },
  );
}

function uncommentAllLogMessagesCommand(jsDebugMessage: DebugMessage) {
  vscode.commands.registerCommand(
    'turboConsoleLog.uncommentAllLogMessages',
    () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration('turboConsoleLog');
      const properties: ExtensionProperties = getExtensionProperties(config);
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        properties.delimiterInsideMessage,
        properties.quote,
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document.getText(line).replace(/\//g, '').trim()}\n`,
            );
          });
        });
      });
    },
  );
}

function deleteAllLogMessagesCommand(jsDebugMessage: DebugMessage) {
  vscode.commands.registerCommand(
    'turboConsoleLog.deleteAllLogMessages',
    () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration('turboConsoleLog');
      const properties: ExtensionProperties = getExtensionProperties(config);
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        properties.delimiterInsideMessage,
        properties.quote,
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ lines }) => {
          const firstLine = lines[0];
          const lastLine = lines[lines.length - 1];
          const lineBeforeFirstLine = new vscode.Range(
            new vscode.Position(firstLine.start.line - 1, 0),
            new vscode.Position(firstLine.end.line - 1, 0),
          );
          const lineAfterLastLine = new vscode.Range(
            new vscode.Position(lastLine.start.line + 1, 0),
            new vscode.Position(lastLine.end.line + 1, 0),
          );
          if (document.lineAt(lineBeforeFirstLine.start).text === '') {
            editBuilder.delete(lineBeforeFirstLine);
          }
          if (document.lineAt(lineAfterLastLine.start).text === '') {
            editBuilder.delete(lineAfterLastLine);
          }
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
          });
        });
      });
    },
  );
}

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
) {
  return {
    wrapLogMessage: workspaceConfig.wrapLogMessage ?? false,
    logMessagePrefix: workspaceConfig.logMessagePrefix ?? '',
    logMessageSuffix: workspaceConfig.logMessageSuffix ?? '',
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd ?? false,
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    quote: workspaceConfig.quote ?? '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage ?? '~',
    includeFileName:
      workspaceConfig.includeFileName ?? false,
    includeLineNum:
      workspaceConfig.includeLineNum ?? false,
    logType: workspaceConfig.logType ?? 'log',
    logFunction: workspaceConfig.logFunction ?? 'log',
  };
}

function getTabSize(tabSize: string | number | undefined): number {
  if (!tabSize) {
    return 4;
  }
  return typeof tabSize === 'string' ? parseInt(tabSize) : tabSize;
}
