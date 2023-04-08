import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, ZeroBasedPosition, zeroBasedLine } from '../../helpers';

test('Log object property', async () => {
  Mocha.before(async () => {
    await openDocument('../files/js/logObjectProperty.js');
  });
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new ZeroBasedPosition(3, 5),
        new ZeroBasedPosition(3, 12),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(zeroBasedLine(9)).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
  }
  Mocha.after(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
