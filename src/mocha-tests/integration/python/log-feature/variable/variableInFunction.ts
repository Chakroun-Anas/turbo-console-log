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
  describe('Variable inside function', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/variable',
        'variableInFunction.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert Python log message for user_name variable inside function', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'variableInFunction.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 5),
            new NaturalEditorPosition(3, 14),
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
        expect(
          /print\(.*process_user.*user_name.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
    it('Should insert Python log message for user_email variable inside function', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'variableInFunction.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(4, 5),
            new NaturalEditorPosition(4, 15),
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
        expect(
          /print\(.*process_user.*user_email.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
