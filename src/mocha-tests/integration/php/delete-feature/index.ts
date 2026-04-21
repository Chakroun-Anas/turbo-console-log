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
  describe('Delete all PHP log messages', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PHP,
        'delete-feature',
        'allLogTypes.php',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should delete all PHP log messages', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.php');
      if (activeTextEditor) {
        const initialLineCount = activeTextEditor.document.lineCount;

        await vscode.commands.executeCommand(
          'turboConsoleLog.deleteAllLogMessages',
          [],
        );

        // Wait for document to update
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

        const textDocument = activeTextEditor.document;
        const finalLineCount = textDocument.lineCount;

        // Verify that lines were deleted (final count should be less than initial)
        expect(finalLineCount).to.be.lessThan(initialLineCount);

        // Verify that no log messages remain (scan for common patterns)
        const fullText = textDocument.getText();
        const logPatterns = [/error_log\("🚀/, /var_dump\("🚀/, /print_r\("🚀/];

        for (const pattern of logPatterns) {
          const matches = fullText.match(pattern);
          // Either no matches, or very few matches (accounting for potential edge cases)
          expect(matches === null || matches.length === 0).to.equal(true);
        }
      }
    });
  });
};
