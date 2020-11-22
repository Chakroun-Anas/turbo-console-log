import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("Insert log message in the context of a function with a bunch of decorators", async () => {
  await openDocument("../files/js/functionWithDecorators.ts");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(7, 19),
        new vscode.Position(7, 23)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(13).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
