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
  describe('For loop variable', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/controlFlow',
        'forLoop.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert log INSIDE the loop body (not above the for statement)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'forLoop.py');
      if (activeTextEditor) {
        // Select `item` on line 3: `    for item in items:`
        //   `    for ` = 8 chars → `item` at cols 9-12 (1-based)
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 9),
            new NaturalEditorPosition(3, 13),
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
        // Log is inserted at line 4 (inside the loop body, before `total += item`)
        const logMessage = textDocument.lineAt(naturalEditorLine(4)).text;
        expect(
          /print\(.*process_items.*item.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
