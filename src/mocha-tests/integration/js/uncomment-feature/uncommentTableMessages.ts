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
  describe('UnComment log messages with table as the log type', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'uncomment-feature',
        'uncommentTableMessages.js',
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
        'uncommentTableMessages.js',
      );
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.uncommentAllLogMessages',
          [
            {
              logType: 'table',
            },
          ],
        );
        const logMessagesLines = [
          naturalEditorLine(10),
          naturalEditorLine(14),
          naturalEditorLine(17),
        ];
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            ...logMessagesLines,
          ]),
        );
        const textDocument = activeTextEditor.document;
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
