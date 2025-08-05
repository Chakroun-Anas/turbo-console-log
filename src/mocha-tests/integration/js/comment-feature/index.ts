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
  describe('Comment all log types (console.log, console.warn, console.error, console.debug, console.info, console.table, myLogger)', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'comment-feature',
        'allLogTypes.ts',
      );
    });

    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });

    it('Should comment all Turbo-generated log messages regardless of log type', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.ts');

      if (activeTextEditor) {
        // Execute comment all log messages command
        await vscode.commands.executeCommand(
          'turboConsoleLog.commentAllLogMessages',
          [],
        );

        // Wait for document changes on all log message lines
        const logMessageLines = [
          naturalEditorLine(9), // console.log("🚀 ~ userData:", userData);
          naturalEditorLine(12), // console.warn("🚀 ~ processUser ~ user:", user);
          naturalEditorLine(15), // console.error("🚀 ~ processUser ~ missing email:", user);
          naturalEditorLine(19), // console.info("🚀 ~ processUser ~ processing user:", user);
          naturalEditorLine(26), // console.debug("🚀 ~ processUser ~ result:", result);
          naturalEditorLine(27), // console.table("🚀 ~ processUser ~ table data:", result);
          naturalEditorLine(28), // myLogger("🚀 ~ processUser ~ custom log:", result);
          naturalEditorLine(34), // console.log("🚀 ~ processedUser:", processedUser);
          naturalEditorLine(37), // Multi-line console.log start
          naturalEditorLine(38), // Multi-line console.log next line
          naturalEditorLine(39), // Multi-line console.log third line
          naturalEditorLine(40), // Multi-line console.log final line
          naturalEditorLine(42), // Multi-line myLogger start
        ];

        await Promise.all(
          documentLinesChanged(activeTextEditor.document, logMessageLines),
        );

        const textDocument = activeTextEditor.document;

        // Verify all log messages are commented
        for (const logMessageLine of logMessageLines) {
          const lineText = textDocument
            .lineAt(logMessageLine)
            .text.replace(/\s/g, '');
          expect(lineText.startsWith('//')).to.equal(true);
        }
      }
    });
  });
};
