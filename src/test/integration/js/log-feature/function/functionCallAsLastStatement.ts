import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
  NaturalEditorPosition,
  naturalEditorLine,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Function call as last statement', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'functionCallAsLastStatement.ts',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert the log message related to function call assigned to a variable as the last statement in the file', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'functionCallAsLastStatement.ts',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 7),
            new NaturalEditorPosition(3, 13),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(5),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(6)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
      }
    });
  });
};
