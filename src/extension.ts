import * as vscode from "vscode";
import { DebugMessage } from "./debug-message";
import { JSDebugMessage } from "./debug-message/js";
import { ExtensionProperties, Message } from "./entities";
import { LineCodeProcessing } from "./line-code-processing";
import { JSLineCodeProcessing } from "./line-code-processing/js";

export function activate(context: vscode.ExtensionContext) {
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  const jsDebugMessage: DebugMessage = new JSDebugMessage(jsLineCodeProcessing);
  // Insert debug message
  vscode.commands.registerCommand(
    "turboConsoleLog.displayLogMessage",
    async () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration("turboConsoleLog");
      const properties: ExtensionProperties = getExtensionProperties(config);
      for (let index = 0; index < editor.selections.length; index++) {
        const selection: vscode.Selection = editor.selections[index];
        const selectedVar: string = document.getText(selection);
        const lineOfSelectedVar: number = selection.active.line;
        // Check if the selection line is not the last one in the document and the selected variable is not empty
        if (selectedVar.trim().length !== 0) {
          await editor.edit((editBuilder) => {
            const logMessageLine = jsDebugMessage.line(
              document,
              lineOfSelectedVar,
              selectedVar
            );
            jsDebugMessage.msg(
              properties.language,
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              properties.wrapLogMessage,
              properties.logMessagePrefix,
              properties.quote,
              properties.addSemicolonInTheEnd,
              properties.insertEnclosingClass,
              properties.insertEnclosingFunction,
              properties.delimiterInsideMessage,
              properties.includeFileNameAndLineNum,
              tabSize
            );
          });
        }
      }
    }
  );
  // Comment all debug messages
  vscode.commands.registerCommand(
    "turboConsoleLog.commentAllLogMessages",
    () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration("turboConsoleLog");
      const properties: ExtensionProperties = getExtensionProperties(config);
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        tabSize,
        properties.delimiterInsideMessage,
        properties.quote
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}// ${document.getText(line).trim()}\n`
            );
          });
        });
      });
    }
  );
  // Uncomment all debug messages
  vscode.commands.registerCommand(
    "turboConsoleLog.uncommentAllLogMessages",
    () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration("turboConsoleLog");
      const properties: ExtensionProperties = getExtensionProperties(config);
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        tabSize,
        properties.delimiterInsideMessage,
        properties.quote
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document.getText(line).replace(/\//g, "").trim()}\n`
            );
          });
        });
      });
    }
  );
  // Delete all debug messages
  vscode.commands.registerCommand(
    "turboConsoleLog.deleteAllLogMessages",
    () => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration("turboConsoleLog");
      const properties: ExtensionProperties = getExtensionProperties(config);
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        tabSize,
        properties.delimiterInsideMessage,
        properties.quote
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
          });
        });
      });
    }
  );
}

export function deactivate() {}

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration
) {
  const language = workspaceConfig.language;
  const wrapLogMessage = workspaceConfig.wrapLogMessage || false;
  const logMessagePrefix = workspaceConfig.logMessagePrefix
    ? workspaceConfig.logMessagePrefix
    : "";
  const addSemicolonInTheEnd = workspaceConfig.addSemicolonInTheEnd || false;
  const insertEnclosingClass = workspaceConfig.insertEnclosingClass;
  const insertEnclosingFunction = workspaceConfig.insertEnclosingFunction;
  const quote = workspaceConfig.quote || '"';
  const delimiterInsideMessage = workspaceConfig.delimiterInsideMessage || "~";
  const includeFileNameAndLineNum =
    workspaceConfig.includeFileNameAndLineNum || false;
  const extensionProperties: ExtensionProperties = {
    language,
    wrapLogMessage,
    logMessagePrefix,
    addSemicolonInTheEnd,
    insertEnclosingClass,
    insertEnclosingFunction,
    quote,
    delimiterInsideMessage,
    includeFileNameAndLineNum,
  };
  return extensionProperties;
}

function getTabSize(tabSize: string | number | undefined): number {
  if (tabSize && typeof tabSize === "number") {
    return tabSize;
  } else if (tabSize && typeof tabSize === "string") {
    return parseInt(tabSize);
  } else {
    return 4;
  }
}
