
import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("Comment log messages inserted by the extension", async () => {
  await openDocument("../files/js/commentLogMessages.js");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(0, 6),
        new vscode.Position(0, 12)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(4).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
