import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, ZeroBasedPosition, zeroBasedLine } from '../../helpers';

test('Insert log message related to a variable declared in a promise callback', async () => {
  await openDocument('../files/js/promiseAnonymousFunction.ts');
  const { activeTextEditor } = vscode.window;
  const zeroBasedLineHelper = zeroBasedLine;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new ZeroBasedPosition(6, 9),
        new ZeroBasedPosition(6, 21),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    assert.strictEqual(
      /console\.log\(.*/.test(
        activeTextEditor.document.lineAt(zeroBasedLineHelper(7)).text,
      ),
      true,
    );
    activeTextEditor.selections = [
      new vscode.Selection(
        new ZeroBasedPosition(8, 9),
        new ZeroBasedPosition(8, 29),
      ),
    ];
    await vscode.commands.executeCommand(
      'turboConsoleLog.displayLogMessage',
      [],
    );
    assert.strictEqual(
      /console\.log\(.*/.test(
        activeTextEditor.document.lineAt(zeroBasedLineHelper(9)).text,
      ),
      true,
    );
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
