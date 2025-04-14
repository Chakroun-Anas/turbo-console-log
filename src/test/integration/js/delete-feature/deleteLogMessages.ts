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
  describe('Delete log messages', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'delete-feature',
        'deleteLogMessages.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should delete log messages inserted by the extension', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'deleteLogMessages.js');
      if (activeTextEditor) {
        const originalLineCount = activeTextEditor.document.lineCount;
        await vscode.commands.executeCommand(
          'turboConsoleLog.deleteAllLogMessages',
          [],
        );
        const logMessagesLines = [naturalEditorLine(2), naturalEditorLine(4)];
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            ...logMessagesLines,
          ]),
        );
        const newLineCount = activeTextEditor.document.lineCount;
        expect(originalLineCount - newLineCount).to.equal(
          logMessagesLines.length,
        );
      }
    });
  });
};
