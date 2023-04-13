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
  describe('Function with many parameters defined in multiple lines', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'functionMultiLineParameters.ts',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert the log log message correctly ', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'functionMultiLineParameters.ts',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(1, 2),
            new vscode.Position(1, 13),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [13]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(13).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(/firstParam/.test(logMessage)).to.equal(true);
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(2, 2),
            new vscode.Position(2, 13),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [13]),
        );
        expect(/secondParam/.test(textDocument.lineAt(13).text)).to.equal(true);
      }
    });
  });
};
