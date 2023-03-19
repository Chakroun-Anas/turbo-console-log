import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument } from '../../helpers';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('Comment log messages inserted by the extension', async () => {
  await openDocument('../files/js/commentLogMessages.js');
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    await vscode.commands.executeCommand(
      'turboConsoleLog.commentAllLogMessages',
      [],
    );
    await wait(250);
    const textDocument = activeTextEditor.document;
    const logMessagesLines = [9, 13, 16];
    for (const logMessageLine of logMessagesLines) {
      assert.strictEqual(
        textDocument
          .lineAt(logMessageLine)
          .text.replace(/\s/g, '')
          .startsWith('//'),
        true,
      );
    }
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
