import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../helpers';
import { ProgrammingLanguage } from '../../../../entities';

export default (): void => {
  describe('UnComment log messages', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'uncomment-feature',
        'uncommentLogMessages.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should uncomment log messages already commented', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'uncommentLogMessages.js',
      );
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.uncommentAllLogMessages',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [9, 13, 16]),
        );
        const textDocument = activeTextEditor.document;
        const logMessagesLines = [9, 13, 16];
        for (const logMessageLine of logMessagesLines) {
          expect(
            textDocument
              .lineAt(logMessageLine)
              .text.replace(/\s/g, '')
              .startsWith('//'),
          ).to.equal(false);
        }
      }
    });
  });
};
