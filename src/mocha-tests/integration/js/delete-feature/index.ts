import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  naturalEditorLine,
  documentLinesChanged,
} from '../../helpers';
import { ProgrammingLanguage } from '../../../../entities';

export default (): void => {
  describe('Delete all log types (console.log, console.warn, console.error, console.debug, console.info, console.table, myLogger)', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'delete-feature',
        'allLogTypes.ts',
      );
    });

    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });

    it('Should delete all Turbo-generated log messages regardless of log type', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.ts');

      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;

        // Execute delete all log messages command
        await vscode.commands.executeCommand(
          'turboConsoleLog.deleteAllLogMessages',
          [],
        );

        const originalLineCount = textDocument.lineCount;

        // Wait for document changes on all log message lines
        const logMessageLines = [
          naturalEditorLine(9),
          naturalEditorLine(12),
          naturalEditorLine(15),
          naturalEditorLine(19),
          naturalEditorLine(26),
          naturalEditorLine(27),
          naturalEditorLine(28),
          naturalEditorLine(34),
          naturalEditorLine(37),
          naturalEditorLine(38),
          naturalEditorLine(39),
          naturalEditorLine(40),
          naturalEditorLine(42),
        ];

        await Promise.all(
          documentLinesChanged(activeTextEditor.document, logMessageLines),
        );

        const newLineCount = activeTextEditor.document.lineCount;
        expect(originalLineCount - newLineCount).to.equal(
          logMessageLines.length,
        );
      }
    });
  });
};
