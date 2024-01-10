import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  NaturalEditorPosition,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Log variable declared in the last line', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/variable',
        'logLastLine.js',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert the log message as the last line of the document', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logLastLine.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(1, 7),
            new NaturalEditorPosition(1, 9),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        // Console log message is appended to the last line of the file starting with /n character
        await Promise.all(documentLinesChanged(activeTextEditor.document, [0]));
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(1).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
      }
    });
  });
};
