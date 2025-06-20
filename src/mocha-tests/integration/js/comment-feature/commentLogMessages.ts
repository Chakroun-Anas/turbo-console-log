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
  describe('Comment log messages with the default log function', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'comment-feature',
        'commentLogMessages.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should comment log messages with the default log function', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'commentLogMessages.js');
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.commentAllLogMessages',
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
          ).to.equal(true);
        }
      }
    });
  });
};
