import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("Insert log message related to a variable which value is a function", async () => {
  await openDocument("../files/js/functionAssignedToVariable.ts");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    const textDocument = activeTextEditor.document;
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(2, 6),
        new vscode.Position(2, 13)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    assert.strictEqual(
      /console\.log\(.*/.test(textDocument.lineAt(5).text),
      true
    );
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(7, 7),
        new vscode.Position(7, 17)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    assert.strictEqual(
      /console\.log\(.*/.test(textDocument.lineAt(10).text),
      true
    );
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(12, 7),
        new vscode.Position(12, 17)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    assert.strictEqual(
      /console\.log\(.*/.test(textDocument.lineAt(18).text),
      true
    );
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
