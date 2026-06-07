import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
  naturalEditorLine,
} from '../../helpers';
import { ProgrammingLanguage } from '../../../../entities';

export default (): void => {
  describe('Comment all Python log messages', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'comment-feature',
        'allLogTypes.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should comment all Python log messages', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.py');
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.commentAllLogMessages',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(5),
            naturalEditorLine(9),
            naturalEditorLine(12),
            naturalEditorLine(15),
            naturalEditorLine(20),
          ]),
        );
        const textDocument = activeTextEditor.document;
        // print on line 5 should now be commented with #
        expect(
          textDocument.lineAt(naturalEditorLine(5)).text.includes('#'),
        ).to.equal(true);
        expect(
          textDocument.lineAt(naturalEditorLine(5)).text.includes('print'),
        ).to.equal(true);
        // logging.debug on line 12 should be commented
        expect(
          textDocument.lineAt(naturalEditorLine(12)).text.includes('#'),
        ).to.equal(true);
        expect(
          textDocument.lineAt(naturalEditorLine(12)).text.includes('logging'),
        ).to.equal(true);
        // logging.info on line 15 should be commented
        expect(
          textDocument.lineAt(naturalEditorLine(15)).text.includes('#'),
        ).to.equal(true);
        expect(
          textDocument.lineAt(naturalEditorLine(15)).text.includes('logging'),
        ).to.equal(true);
      }
    });
  });
};
