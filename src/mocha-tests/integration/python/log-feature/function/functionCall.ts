import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
  NaturalEditorPosition,
  naturalEditorLine,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Function call assignment', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/function',
        'functionCall.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert Python log message for data variable (function call result)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'functionCall.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 5),
            new NaturalEditorPosition(3, 9),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleLog',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(4),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(4)).text;
        expect(/print\(.*process.*data.*\)/.test(logMessage)).to.equal(true);
      }
    });
    it('Should insert Python log message for result variable (function call result)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'functionCall.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(4, 5),
            new NaturalEditorPosition(4, 11),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleLog',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(5),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(5)).text;
        expect(/print\(.*process.*result.*\)/.test(logMessage)).to.equal(true);
      }
    });
  });
};
