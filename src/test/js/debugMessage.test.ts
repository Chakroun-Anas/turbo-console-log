import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as Mocha from "mocha";
import { LineCodeProcessing } from "../../line-code-processing";
import { DebugMessage } from "../../debug-message";
import { JSLineCodeProcessing } from "../../line-code-processing/js";
import { JSDebugMessage } from "../../debug-message/js";

suite("Turbo Console Log: JavaScript", () => {
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  const jsDebugMessage: DebugMessage = new JSDebugMessage(jsLineCodeProcessing);
  Mocha.before(async () => {
    vscode.window.showInformationMessage("Running integration tests");
  });
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
  test("Block closing brace line num", async () => {
    await openDocument("../files/js/functionParamWithType.ts");
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor) {
      const lineNum: number = jsDebugMessage.blockClosingBraceLine(
        activeTextEditor.document,
        0
      );
      assert.strictEqual(lineNum, 7);
    }
  });
  test("Insert log message related to a primitive variable", async () => {
    await openDocument("../files/js/primitiveVariable.js");
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor) {
      activeTextEditor.selections = [
        new vscode.Selection(
          new vscode.Position(0, 6),
          new vscode.Position(0, 14)
        ),
      ];
      await vscode.commands.executeCommand(
        "turboConsoleLog.displayLogMessage",
        []
      );
      const textDocument = activeTextEditor.document;
      const logMessage = textDocument.lineAt(1).text;
      assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    }
  });
  test("Insert log message related to an object variable", async () => {
    await openDocument("../files/js/objectVariable.js");
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
  });
  test("Insert log message related to a function parameter", async () => {
    await openDocument("../files/js/function.js");
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor) {
      activeTextEditor.selections = [
        new vscode.Selection(
          new vscode.Position(0, 18),
          new vscode.Position(0, 26)
        ),
      ];
      await vscode.commands.executeCommand(
        "turboConsoleLog.displayLogMessage",
        []
      );
      const textDocument = activeTextEditor.document;
      const logMessage = textDocument.lineAt(1).text;
      assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
      assert.strictEqual(logMessage.includes("sayHello"), true);
    }
  });
  test("Insert log message related to a class constructor parameter", async () => {
    await openDocument("../files/js/classConstructor.js");
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
      assert.strictEqual(logMessage.includes("constructor"), true);
    }
  });
  test("Insert log message related to a class function parameter", async () => {
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
  });
  test("Insert log message related to a function parameter within a class function", async () => {
    await openDocument("../files/js/classNestedFunction.js");
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
  });
});

async function openDocument(documentPath: string) {
  const uri = path.join(__dirname, documentPath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
}
