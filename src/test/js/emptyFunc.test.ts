import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, ZeroBasedPosition, zeroBasedLine } from '../helpers';

suite('Empty functions', async () => {
  const { activeTextEditor } = vscode.window;
  const zeroBasedLineHelper = zeroBasedLine;
  Mocha.afterEach(async () => {
    await openDocument('../files/js/emptyFunc.ts');
  });
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
  test('Example 01', async () => {
    if (activeTextEditor) {
      activeTextEditor.selections = [
        new vscode.Selection(
          new ZeroBasedPosition(5, 15),
          new ZeroBasedPosition(5, 30),
        ),
      ];
      await vscode.commands.executeCommand(
        'turboConsoleLog.displayLogMessage',
        [],
      );
      const textDocument = activeTextEditor.document;
      assert.strictEqual(
        /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(7)).text),
        true,
      );
      const logMessage = textDocument.lineAt(zeroBasedLineHelper(8)).text;
      assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    }
  });
  test('Example 02', async () => {
    if (activeTextEditor) {
      activeTextEditor.selections = [
        new vscode.Selection(
          new ZeroBasedPosition(14, 19),
          new ZeroBasedPosition(14, 25),
        ),
      ];
      await vscode.commands.executeCommand(
        'turboConsoleLog.displayLogMessage',
        [],
      );
      const textDocument = activeTextEditor.document;
      assert.strictEqual(
        /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(14)).text),
        true,
      );
      const logMessage = textDocument.lineAt(zeroBasedLineHelper(15)).text;
      assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    }
  });
});
