import * as assert from 'assert';
import * as vscode from 'vscode';
import Mocha from 'mocha';
import { openDocument } from '../../helpers';

test('Insert log message related to a primitive variable', async () => {
  await openDocument('../files/js/primitiveVariable.js');
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(0, 6),
        new vscode.Position(0, 14),
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
