import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("Insert log message related to a deconstructred property assigned to a variable", async () => {
  await openDocument("../files/js/deconstructionVarAssignment.tsx");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(13, 5),
        new vscode.Position(13, 13)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    assert.strictEqual(
      /console\.log\(.*/.test(activeTextEditor.document.lineAt(20).text),
      true
    );
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(25, 11),
        new vscode.Position(25, 15)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    assert.strictEqual(
      /console\.log\(.*/.test(activeTextEditor.document.lineAt(26).text),
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
