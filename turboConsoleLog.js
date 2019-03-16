const vscode = require("vscode");
const logMessage = require("./log-message");
const autoSelectVariable = require("./line-code-processing").autoSelectVariable;

/**
 * Activation method
 * @param {ExtensionContext} context
 * @see {@link https://code.visualstudio.com/api/references/vscode-api#ExtensionContext
 */
function activate(context) {
  vscode.commands.registerCommand("turboConsoleLog.displayLogMessage", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const tabSize = editor.options.tabSize;
    const document = editor.document;
    let selection = editor.selection;
    let selectedVar = document.getText(selection);
    const lineOfSelectedVar = selection.active.line;
    // select variable in current cursor.
    if (selectedVar.trim().length === 0) {
      const currentLine = document.lineAt(lineOfSelectedVar);
      const autoSelectVar = autoSelectVariable(
        currentLine.text,
        selection.start.character
      );
      if (autoSelectVar && autoSelectVar.text) {
        selectedVar = autoSelectVar.text;
        selection = new vscode.Selection(
          new vscode.Position(currentLine.lineNumber, autoSelectVar.begin),
          new vscode.Position(autoSelectVar.end)
        );
      }
    }
    // Check if the selection line is not the last one in the document
    if (!(lineOfSelectedVar === document.lineCount - 1)) {
      editor.edit(editBuilder => {
        const wrapLogMessage =
          vscode.workspace.getConfiguration().wrapLogMessage || false;
        const logMessagePrefix = vscode.workspace.getConfiguration()
          .logMessagePrefix;
        const quote = vscode.workspace.getConfiguration().quote;
        const addSemicolonInTheEnd =
          vscode.workspace.getConfiguration().addSemicolonInTheEnd || false;
        editBuilder.insert(
          new vscode.Position(lineOfSelectedVar + 1, 0),
          logMessage.message(
            document,
            selectedVar,
            lineOfSelectedVar,
            wrapLogMessage,
            logMessagePrefix,
            quote,
            addSemicolonInTheEnd,
            tabSize
          )
        );
      });
    }
  });
  vscode.commands.registerCommand(
    "turboConsoleLog.commentAllLogMessages",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const logMessagePrefix =
        vscode.workspace.getConfiguration().logMessagePrefix || "TCL";
      const logMessages = logMessage.detectAll(
        document,
        tabSize,
        logMessagePrefix
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach(({ range }) => {
            editBuilder.delete(range);
            editBuilder.insert(
              new vscode.Position(range.start.line, 0),
              `${spaces}// ${document.getText(range).trim()}\n`
            );
            // editBuilder.insert(new vscode.Position(range.start.line, 80), `Good`)
          });
        });
      });
    }
  );
  vscode.commands.registerCommand(
    "turboConsoleLog.uncommentAllLogMessages",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const logMessagePrefix =
        vscode.workspace.getConfiguration().logMessagePrefix || "TCL";
      const logMessages = logMessage.detectAll(
        document,
        tabSize,
        logMessagePrefix
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach(({ range }) => {
            editBuilder.delete(range);
            editBuilder.insert(
              new vscode.Position(range.start.line, 0),
              `${spaces}${document
                .getText(range)
                .replace(/\//g, "")
                .trim()}\n`
            );
          });
        });
      });
    }
  );
  vscode.commands.registerCommand(
    "turboConsoleLog.deleteAllLogMessages",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const logMessagePrefix =
        vscode.workspace.getConfiguration().logMessagePrefix || "TCL";
      const logMessages = logMessage.detectAll(
        document,
        tabSize,
        logMessagePrefix
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ lines }) => {
          lines.forEach(({ range }) => {
            editBuilder.delete(range);
          });
        });
      });
    }
  );
}

exports.activate = activate;
