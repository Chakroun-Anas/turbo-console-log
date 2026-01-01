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
  describe('Quick integration scaffold', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature',
        'quickIntegration.ts',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor', []);
    });

    it('Should insert a console.log for a simple variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'quickIntegration.ts');
      if (activeTextEditor) {
        // select the const x variable name
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(0, 9),
            new NaturalEditorPosition(0, 10),
          ),
        ];
        await vscode.commands.executeCommand('turboConsoleLog.insertConsoleLog', []);
        await Promise.all(documentLinesChanged(activeTextEditor.document, [naturalEditorLine(1)]));
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(1)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
      }
    });
  });
};
