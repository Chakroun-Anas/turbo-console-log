import * as assert from "assert";
import * as vscode from "vscode";
import Mocha from "mocha";
import { openDocument } from "../helpers";

test("Insert log message related to a class function param", async () => {
  await openDocument("../files/js/classFunction.js");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(1, 14),
        new vscode.Position(1, 22)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(2).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    // Class name
    assert.strictEqual(logMessage.includes("Person"), true);
    // Function name
    assert.strictEqual(logMessage.includes("sayHello"), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
