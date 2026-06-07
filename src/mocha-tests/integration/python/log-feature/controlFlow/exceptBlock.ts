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
  describe('Except-as block variable', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/controlFlow',
        'exceptBlock.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert log INSIDE the except body (not after the try/except block)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'exceptBlock.py');
      if (activeTextEditor) {
        // Select `error` on line 4: `    except ZeroDivisionError as error:`
        //   `    except ZeroDivisionError as ` = 32 chars → `error` at cols 33-37 (1-based)
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(4, 33),
            new NaturalEditorPosition(4, 38),
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
        // Log is inserted at line 5 (first line inside except body, before `return str(error)`)
        const logMessage = textDocument.lineAt(naturalEditorLine(5)).text;
        expect(
          /print\(.*safe_divide.*error.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
