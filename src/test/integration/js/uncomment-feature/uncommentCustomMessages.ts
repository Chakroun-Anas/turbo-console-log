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
  describe('UnComment custom messages', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'uncomment-feature',
        'uncommentCustomMessages.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should uncomment custom messages already commented', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'uncommentCustomMessages.js',
      );
      if (activeTextEditor) {
        await vscode.commands.executeCommand(
          'turboConsoleLog.uncommentAllLogMessages',
          [{
            logFunction: 'fancy.debug.func',
          }],
        );
        const logMessagesLines = [
            naturalEditorLine(10),
            naturalEditorLine(14),
            naturalEditorLine(17),
        ]
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [...logMessagesLines]),
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
