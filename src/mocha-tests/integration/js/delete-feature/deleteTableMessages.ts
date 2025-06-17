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
  describe('Delete log messages with the logType setting being set to table', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'delete-feature',
        'deleteTableMessages.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should delete log messages with the table as the log type', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'deleteTableMessages.js',
      );
      if (activeTextEditor) {
        const originalLineCount = activeTextEditor.document.lineCount;
        await vscode.commands.executeCommand(
          'turboConsoleLog.deleteAllLogMessages',
          [
            {
              logType: 'table',
            },
          ],
        );
        const logMessagesLines = [
          naturalEditorLine(6),
          naturalEditorLine(9),
          naturalEditorLine(16),
        ];
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
