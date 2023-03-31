import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, updateExtensionProperty } from '../../helpers';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const initialLogFunction = vscode.workspace
  .getConfiguration()
  .get('turboConsoleLog.logFunction') as string;

test('Comment custom log messages inserted by the extension', async () => {
  Mocha.before(async () => {
    await updateExtensionProperty('logFunction', 'fancy.debug.func');
  });
  Mocha.after(async () => {
    await updateExtensionProperty('logFunction', initialLogFunction);
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    await openDocument('../files/js/commentCustomLogMessages.js');
    await vscode.commands.executeCommand(
      'turboConsoleLog.commentAllLogMessages',
      [],
    );
    await wait(500);
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
});
