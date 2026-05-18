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
  describe('Comment all PHP log messages', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PHP,
        'comment-feature',
        'allLogTypes.php',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should comment all PHP log messages', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.php');
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.commentAllLogMessages',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(13),
            naturalEditorLine(17),
            naturalEditorLine(20),
            naturalEditorLine(24),
            naturalEditorLine(32),
            naturalEditorLine(33),
            naturalEditorLine(39),
            naturalEditorLine(41),
          ]),
        );
        expect(true).to.equal(true);
        const textDocument = activeTextEditor.document;
        // Check that error_log is commented
        expect(
          textDocument.lineAt(naturalEditorLine(13)).text.includes('//'),
        ).to.equal(true);
        expect(
          textDocument.lineAt(naturalEditorLine(13)).text.includes('error_log'),
        ).to.equal(true);
        // Check that var_dump is commented
        expect(
          textDocument.lineAt(naturalEditorLine(17)).text.includes('//'),
        ).to.equal(true);
        expect(
          textDocument.lineAt(naturalEditorLine(17)).text.includes('var_dump'),
        ).to.equal(true);
        // Check that print_r is commented
        expect(
          textDocument.lineAt(naturalEditorLine(33)).text.includes('//'),
        ).to.equal(true);
        expect(
          textDocument.lineAt(naturalEditorLine(33)).text.includes('print_r'),
        ).to.equal(true);
      }
    });
  });
};
