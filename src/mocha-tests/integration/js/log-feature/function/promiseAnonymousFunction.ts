import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  NaturalEditorPosition,
  naturalEditorLine,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Function passed as a promise callback', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'promiseAnonymousFunction.ts',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Insert log message correctly', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'promiseAnonymousFunction.ts',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(6, 9),
            new NaturalEditorPosition(6, 21),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(7),
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            activeTextEditor.document.lineAt(naturalEditorLine(7)).text,
          ),
        ).to.equal(true);
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(8, 9),
            new NaturalEditorPosition(8, 29),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            activeTextEditor.document.lineAt(naturalEditorLine(9)).text,
          ),
        ).to.equal(true);
      }
    });
  });
};
