import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, ZeroBasedPosition } from '../helpers';

test('Insert log message in the last line of the file', async () => {
  await openDocument('../files/js/logLastLine.js');
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new ZeroBasedPosition(1, 7),
        new ZeroBasedPosition(1, 9),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(1).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
