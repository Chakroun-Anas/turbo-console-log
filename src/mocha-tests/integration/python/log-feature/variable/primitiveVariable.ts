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
  describe('Primitive variable', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/variable',
        'primitiveVariable.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert Python log message for name variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'primitiveVariable.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(1, 1),
            new NaturalEditorPosition(1, 5),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleLog',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(2),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(2)).text;
        expect(/print\(.*name.*\)/.test(logMessage)).to.equal(true);
      }
    });
    it('Should insert Python log message for age variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'primitiveVariable.py');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 1),
            new NaturalEditorPosition(3, 4),
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
        expect(/print\(.*age.*\)/.test(logMessage)).to.equal(true);
      }
    });
  });
};
