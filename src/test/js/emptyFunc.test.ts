import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("Parameter of empty function", async () => {
  await openDocument("../files/js/emptyFunc.ts");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(4, 14),
        new vscode.Position(4, 29)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(7).text;
    assert.strictEqual(/{/.test(textDocument.lineAt(6).text), true);
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    assert.strictEqual(/}/.test(textDocument.lineAt(8).text), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
