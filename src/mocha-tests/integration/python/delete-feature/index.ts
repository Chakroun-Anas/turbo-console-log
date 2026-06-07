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
  describe('Delete all Python log messages', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'delete-feature',
        'allLogTypes.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should delete all Python log messages', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.py');
      if (activeTextEditor) {
        const initialLineCount = activeTextEditor.document.lineCount;

        await vscode.commands.executeCommand(
          'turboConsoleLog.deleteAllLogMessages',
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
        const finalLineCount = textDocument.lineCount;

        // Verify that log lines were removed
        expect(finalLineCount).to.be.lessThan(initialLineCount);

        // Verify no turbo log patterns remain
        const fullText = textDocument.getText();
        const logPatterns = [
          /print\("🚀/,
          /logging\.debug\("🚀/,
          /logging\.info\("🚀/,
          /logging\.warning\("🚀/,
        ];
        for (const pattern of logPatterns) {
          expect(pattern.test(fullText)).to.equal(false);
        }
      }
    });
  });
};
