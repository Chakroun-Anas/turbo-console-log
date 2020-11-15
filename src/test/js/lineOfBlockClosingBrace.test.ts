import * as assert from "assert";
import * as vscode from "vscode";
import Mocha from "mocha";
import { openDocument } from "../helpers";
import { DebugMessage } from "../../debug-message";
import { JSDebugMessage } from "../../debug-message/js";
import { LineCodeProcessing } from "../../line-code-processing";
import { JSLineCodeProcessing } from "../../line-code-processing/js";

test("Determine the closing brace line num", async () => {
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  const jsDebugMessage: DebugMessage = new JSDebugMessage(jsLineCodeProcessing);
  await openDocument("../files/js/lineOfBlockClosingBrace.ts");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    assert.strictEqual(
      jsDebugMessage.blockClosingBraceLine(activeTextEditor.document, 0),
      4
    );
    assert.strictEqual(
      jsDebugMessage.blockClosingBraceLine(activeTextEditor.document, 1),
      3
    );
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
