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
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/object',
        'objectVariable.js',
      );
    });
    Mocha.after(async () => {
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
  });
};
