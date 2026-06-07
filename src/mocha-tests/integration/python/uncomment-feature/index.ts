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
  describe('Uncomment all Python log messages', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'uncomment-feature',
        'allLogTypes.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should uncomment all Python log messages', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.py');
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.uncommentAllLogMessages',
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
        // print on line 5 should no longer start with #
        const line5 = textDocument.lineAt(naturalEditorLine(5)).text.trim();
        expect(line5.startsWith('#')).to.equal(false);
        expect(line5.includes('print')).to.equal(true);
        // logging.debug on line 12 should be uncommented
        const line12 = textDocument.lineAt(naturalEditorLine(12)).text.trim();
        expect(line12.startsWith('#')).to.equal(false);
        expect(line12.includes('logging')).to.equal(true);
        // logging.info on line 15 should be uncommented
        const line15 = textDocument.lineAt(naturalEditorLine(15)).text.trim();
        expect(line15.startsWith('#')).to.equal(false);
        expect(line15.includes('logging')).to.equal(true);
      }
    });
  });
};
