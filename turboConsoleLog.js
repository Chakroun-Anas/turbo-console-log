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
    let selectedVar = document.getText(selection);
    const lineOfSelectedVar = selection.active.line;

    // If selected range is empty, then select whole word
    if (!selectedVar) {
      const wordRangeAtSelection = document.getWordRangeAtPosition(
        selection.active
      );

      if (wordRangeAtSelection) {
        const selectedWordRange = new vscode.Selection(
          wordRangeAtSelection.start.line,
          wordRangeAtSelection.start.character,
          wordRangeAtSelection.end.line,
          wordRangeAtSelection.end.character
        );
        editor.selection = selectedWordRange;
        selectedVar = document.getText(selectedWordRange);
      }
    }

    // Check if the selection line is not the last one in the document and the selected variable is not empty
    if (
      !(lineOfSelectedVar === document.lineCount - 1) &&
      selectedVar.trim().length !== 0
    ) {
      editor.edit(editBuilder => {
        const wrapLogMessage =
          vscode.workspace.getConfiguration().wrapLogMessage || false;
        const useDoubleQuote =
          vscode.workspace.getConfiguration().useDoubleQuote || false;
        const addSemicolonInTheEnd =
          vscode.workspace.getConfiguration().addSemicolonInTheEnd || false;
        editBuilder.insert(
          new vscode.Position(lineOfSelectedVar + 1, 0),
          logMessage.message(
            document,
            selectedVar,
            lineOfSelectedVar,
            wrapLogMessage,
            useDoubleQuote,
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
      const logMessages = logMessage.detectAll(document, tabSize);
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
      const logMessages = logMessage.detectAll(document, tabSize);
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
      const logMessages = logMessage.detectAll(document, tabSize);
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
