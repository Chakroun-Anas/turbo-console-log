const vscode = require("vscode");
const logMessage = require("./log-message");
const autoSelectVariable = require("./line-code-processing").autoSelectVariable;

const getLanguageConfig = require("./script-languages").getLanguageConfig;
/**
 * Activation method
 * @param {ExtensionContext} context
 * @see {@link https://code.visualstudio.com/api/references/vscode-api#ExtensionContext
 */
function activate(context) {
  vscode.commands.registerCommand(
    "turboConsoleLog.displayLogMessage",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const languageConfig = getLanguageConfig(editor.document.languageId);
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const config = vscode.workspace.getConfiguration("turboConsoleLog");
      const wrapLogMessage = config.wrapLogMessage || false;
      const logMessagePrefix =
        config.logMessagePrefix.length > 0 ? config.logMessagePrefix : "TCL";
      const quote = config.quote;
      const addSemicolonInTheEnd = config.addSemicolonInTheEnd || false;
      const insertEnclosingClass = config.insertEnclosingClass;
      const insertEnclosingFunction = config.insertEnclosingFunction;

      for (let index = 0; index < editor.selections.length; index++) {
        let selection = editor.selections[index];
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
          await editor.edit(editBuilder => {

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
                insertEnclosingClass,
                insertEnclosingFunction,
                tabSize,
                languageConfig
              )
            );
          });
        }
      }
    }
  )

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
        vscode.workspace.getConfiguration("turboConsoleLog").logMessagePrefix ||
        "TCL";
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
        vscode.workspace.getConfiguration("turboConsoleLog").logMessagePrefix ||
        "TCL";
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
        vscode.workspace.getConfiguration("turboConsoleLog").logMessagePrefix ||
        "TCL";
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
