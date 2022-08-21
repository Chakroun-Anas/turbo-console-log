import Mocha from 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { openDocument, zeroBasedLine, ZeroBasedPosition } from '../helpers';

suite('Insert log message related to an anonymous function context', () => {
  const { activeTextEditor } = vscode.window;
  const zeroBasedLineHelper = zeroBasedLine;
  Mocha.afterEach(async () => {
    await openDocument('../files/js/anonymousFunctions.ts');
  });
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
  suite('Single line', () => {
    test('Assigned to a variable', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(3, 29),
            new ZeroBasedPosition(3, 37),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(3)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(4)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return /.test(textDocument.lineAt(zeroBasedLineHelper(5)).text),
          true,
        );
      }
    });
    test('Parameter of a function', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(5, 14),
            new ZeroBasedPosition(5, 20),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(5)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(6)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return member.include\('S'\)/.test(
            textDocument.lineAt(zeroBasedLineHelper(7)).text,
          ),
          true,
        );
        assert.strictEqual(
          /}\)/.test(textDocument.lineAt(zeroBasedLineHelper(8)).text),
          true,
        );
      }
    });
    test('Chained call', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(8, 14),
            new ZeroBasedPosition(8, 18),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(8)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(9)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return item.index !== original.index/.test(
            textDocument.lineAt(zeroBasedLineHelper(10)).text,
          ),
          true,
        );
        assert.strictEqual(
          /}\)/.test(textDocument.lineAt(zeroBasedLineHelper(11)).text),
          true,
        );
      }
    });
  });
  suite('Multiple lines', () => {
    test('Example 01', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(12, 16),
            new ZeroBasedPosition(12, 22),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(12)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(13)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return checkAccountingPeriodDivide\(budget._id, accountingPeriodId\)/.test(
            textDocument.lineAt(zeroBasedLineHelper(14)).text,
          ),
          true,
        );
        assert.strictEqual(
          /}\)/.test(textDocument.lineAt(zeroBasedLineHelper(15)).text),
          true,
        );
      }
    });
    test('Example 02', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(19, 16),
            new ZeroBasedPosition(19, 22),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(19)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(20)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return checkAccountingPeriodDivide\(budget._id\)/.test(
            textDocument.lineAt(zeroBasedLineHelper(21)).text,
          ),
          true,
        );
        assert.strictEqual(
          /}\)/.test(textDocument.lineAt(zeroBasedLineHelper(23)).text),
          true,
        );
      }
    });
    test('Example 03', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(27, 18),
            new ZeroBasedPosition(27, 24),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(27)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(28)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return checkAccountingPeriodDivide\(budget._id, accountingPeriodId\)/.test(
            textDocument.lineAt(zeroBasedLineHelper(29)).text,
          ),
          true,
        );
        assert.strictEqual(
          /}\)/.test(textDocument.lineAt(zeroBasedLineHelper(30)).text),
          true,
        );
      }
    });
    test('Example 04', async () => {
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(35, 18),
            new ZeroBasedPosition(35, 24),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        const textDocument = activeTextEditor.document;
        assert.strictEqual(
          /\{\s*$/.test(textDocument.lineAt(zeroBasedLineHelper(35)).text),
          true,
        );
        assert.strictEqual(
          /console\.log\(.*/.test(
            textDocument.lineAt(zeroBasedLineHelper(36)).text,
          ),
          true,
        );
        assert.strictEqual(
          /return checkAccountingPeriodDivide\(budget._id\)/.test(
            textDocument.lineAt(zeroBasedLineHelper(37)).text,
          ),
          true,
        );
        assert.strictEqual(
          /}\)/.test(textDocument.lineAt(zeroBasedLineHelper(39)).text),
          true,
        );
      }
    });
  });
});
