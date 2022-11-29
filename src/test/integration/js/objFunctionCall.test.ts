import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument } from '../../helpers';

test('Insert log message related to an object function call', async () => {
  await openDocument('../files/js/objFunctionCall.ts');
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(3, 3),
        new vscode.Position(3, 20),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(8).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
