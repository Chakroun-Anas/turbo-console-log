import * as assert from "assert";
import * as vscode from "vscode";
import Mocha from "mocha";
import { openDocument } from "../helpers";

test("Insert log message related to a function parameter within a class function", async () => {
  await openDocument("../files/js/classNestedFunctions.js");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(2, 29),
        new vscode.Position(2, 41)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(3).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    // Class name
    assert.strictEqual(logMessage.includes("Person"), true);
    // Function name
    assert.strictEqual(logMessage.includes("anotherFunction"), true);
    // Variable name
    assert.strictEqual(logMessage.includes("anotherParam"), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
