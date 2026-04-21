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
  describe('Uncomment all PHP log messages', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PHP,
        'uncomment-feature',
        'allLogTypes.php',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should uncomment all PHP log messages', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.php');
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.uncommentAllLogMessages',
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
        const textDocument = activeTextEditor.document;
        // Check that error_log is uncommented (no // prefix)
        const line13 = textDocument.lineAt(naturalEditorLine(13)).text.trim();
        expect(line13.startsWith('//')).to.equal(false);
        expect(line13.includes('error_log')).to.equal(true);
        // Check that var_dump is uncommented
        const line17 = textDocument.lineAt(naturalEditorLine(17)).text.trim();
        expect(line17.startsWith('//')).to.equal(false);
        expect(line17.includes('var_dump')).to.equal(true);
        // Check that print_r is uncommented
        const line20 = textDocument.lineAt(naturalEditorLine(33)).text.trim();
        expect(line20.startsWith('//')).to.equal(false);
        expect(line20.includes('print_r')).to.equal(true);
      }
    });
  });
};
