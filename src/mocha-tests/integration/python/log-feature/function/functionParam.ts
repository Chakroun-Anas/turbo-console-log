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
  describe('Function parameter', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/function',
        'functionParam.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert Python log message for function parameter price', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'functionParam.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 21),
            new NaturalEditorPosition(2, 26),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleLog',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(3),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(3)).text;
        expect(
          /print\(.*calculate_total.*price.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
    it('Should insert Python log message for function parameter tax', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'functionParam.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 28),
            new NaturalEditorPosition(2, 31),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleLog',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(3),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(3)).text;
        expect(
          /print\(.*calculate_total.*tax.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
