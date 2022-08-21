import * as assert from 'assert';
import * as vscode from 'vscode';
import Mocha from 'mocha';
import { openDocument, zeroBasedLine, ZeroBasedPosition } from '../helpers';

test('Insert log message related to a class function param', async () => {
  await openDocument('../files/js/classFunction.js');
  const { activeTextEditor } = vscode.window;
  const zeroBasedLineHelper = zeroBasedLine;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new ZeroBasedPosition(2, 12),
        new ZeroBasedPosition(2, 20),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(zeroBasedLineHelper(3)).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    // Class name
    assert.strictEqual(logMessage.includes('Person'), true);
    // Function name
    assert.strictEqual(logMessage.includes('sayHello'), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
