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
  describe('Delete debug messages', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'delete-feature',
        'deleteDebugMessages.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should delete debug messages inserted by the extension', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'deleteDebugMessages.js');
      if (activeTextEditor) {
        const originalLineCount = activeTextEditor.document.lineCount;
        await vscode.commands.executeCommand(
          'turboConsoleLog.deleteAllLogMessages',
          [{
            logType: 'debug',
          }],
        );
        const debugMessagesLines = [naturalEditorLine(2), naturalEditorLine(4)];
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            ...debugMessagesLines,
          ]),
        );
        const newLineCount = activeTextEditor.document.lineCount;
        expect(originalLineCount - newLineCount).to.equal(
          debugMessagesLines.length,
        );
      }
    });
  });
};
