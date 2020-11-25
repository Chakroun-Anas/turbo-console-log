import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("Insert log message related to a multilines function parameter ", async () => {
  await openDocument("../files/js/functionMultiLineParameters.ts");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(1, 2),
        new vscode.Position(1, 13)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(13).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    assert.strictEqual(/firstParam/.test(logMessage), true);
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(2, 2),
        new vscode.Position(2, 13)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    assert.strictEqual(/secondParam/.test(textDocument.lineAt(13).text), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
