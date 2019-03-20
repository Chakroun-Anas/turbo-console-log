const vscode = require("vscode");
const logMessage = require("./log-message");

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
    const selection = editor.selection;
    const selectedVar = document.getText(selection);
    const lineOfSelectedVar = selection.active.line;
    // Check if the selection line is not the last one in the document and the selected variable is not empty
    if (
      !(lineOfSelectedVar === document.lineCount - 1) &&
      selectedVar.trim().length !== 0
    ) {
      editor.edit(editBuilder => {
        const config = vscode.workspace.getConfiguration("turboConsoleLog");
        const wrapLogMessage = config.wrapLogMessage || false;
        const logMessagePrefix = config.logMessagePrefix;
        const quote = config.quote;
        const addSemicolonInTheEnd = config.addSemicolonInTheEnd || false;

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
        vscode.workspace.getConfiguration("turboConsoleLog").logMessagePrefix || "TCL";
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
        vscode.workspace.getConfiguration("turboConsoleLog").logMessagePrefix || "TCL";
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
        vscode.workspace.getConfiguration("turboConsoleLog").logMessagePrefix || "TCL";
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
