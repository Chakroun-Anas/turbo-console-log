import * as assert from 'assert';
import * as vscode from 'vscode';
import Mocha from 'mocha';
import { openDocument, ZeroBasedPosition, zeroBasedLine } from '../helpers';

test('Insert log message related to a function parameter within a class function', async () => {
  await openDocument('../files/js/classNestedFunctions.js');
  const { activeTextEditor } = vscode.window;
  const zeroBasedLineHelper = zeroBasedLine;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new ZeroBasedPosition(3, 30),
        new ZeroBasedPosition(3, 42),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(zeroBasedLineHelper(4)).text;
    assert.strictEqual(/console\.log\(.*/.test(logMessage), true);
    // Class name
    assert.strictEqual(logMessage.includes('Person'), true);
    // Function name
    assert.strictEqual(logMessage.includes('anotherFunction'), true);
    // Variable name
    assert.strictEqual(logMessage.includes('anotherParam'), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
