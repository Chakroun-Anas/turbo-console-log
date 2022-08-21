import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, zeroBasedLine, ZeroBasedPosition } from '../helpers';

suite(
  'Insert log message related to a variable with a function as the value',
  () => {
    const { activeTextEditor } = vscode.window;
    const zeroBasedLineHelper = zeroBasedLine;
    Mocha.afterEach(async () => {
      await openDocument('../files/js/functionAssignedToVariable.ts');
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    test('Example 01', async () => {
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(3, 7),
          new ZeroBasedPosition(3, 14),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(6)).text,
          ),
          true,
        );
      }
    });
    test('Example 02', async () => {
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(7, 7),
          new ZeroBasedPosition(3, 17),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(10)).text,
          ),
          true,
        );
      }
    });
    test('Example 03', async () => {
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(11, 7),
          new ZeroBasedPosition(11, 34),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(17)).text,
          ),
          true,
        );
      }
    });
  },
);
