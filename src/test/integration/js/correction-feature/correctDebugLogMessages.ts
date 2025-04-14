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
  describe('Correct debug log messages with correctAllLogMessagesCommand', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'correction-feature',
        'correctDebugLogMessages.js',
      );
    });

    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });

    it('Should update outdated debug log messages with the correct filename and line number', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'correctDebugLogMessages.js');

      if (activeTextEditor) {
        const document = activeTextEditor.document;
        const currentFileName = document.fileName.split('/').pop() ?? '';

        // Execute the command to correct log messages
        await vscode.commands.executeCommand(
          'turboConsoleLog.correctAllLogMessages',
          [
            {
              logType: 'debug',
            },
          ],
        );

        const logMessagesLines = [
          naturalEditorLine(11),
          naturalEditorLine(16),
          naturalEditorLine(20),
        ];

        // Wait for the document to reflect changes
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [...logMessagesLines]),
        );
        
        for (const logMessageLine of logMessagesLines) {
          const lineText = document
            .lineAt(logMessageLine)
            .text.replace(/\s/g, '');

          // Check if the filename has been corrected
          expect(lineText).to.include(currentFileName);

          // Check if the line number is now correct
          expect(lineText).to.match(new RegExp(`:${logMessageLine + 1}`));
        }
      }
    });
  });
};
