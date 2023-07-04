import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Object assigned to a variable', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/object',
        'objectVariable.js',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should handles inserting a log message related to an object assigned to a variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'objectVariable.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(0, 6),
            new vscode.Position(0, 12),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(documentLinesChanged(activeTextEditor.document, [4]));
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(4).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
      }
    });
    it('Should handles inserting a log message related to an object assigned to a variable (simple comment on first line)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'objectVariable.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(5, 13),
            new vscode.Position(5, 23),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [24]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(24).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
      }
    });
    it('Should handles inserting a log message related to an object assigned to a variable (multiline comment of first property)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'objectVariable.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(25, 13),
            new vscode.Position(25, 24),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [46]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(46).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
      }
    });
  });
};
