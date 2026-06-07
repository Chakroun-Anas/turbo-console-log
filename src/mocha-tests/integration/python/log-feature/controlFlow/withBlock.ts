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
  describe('With-as block variable', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/controlFlow',
        'withBlock.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert log INSIDE the with body (not after the block)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'withBlock.py');
      if (activeTextEditor) {
        // Select `handle` on line 2: `    with open(path) as handle:`
        //   `    with open(path) as ` = 23 chars → `handle` at cols 24-29 (1-based)
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 24),
            new NaturalEditorPosition(2, 30),
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
        // Log is inserted at line 3 (first line inside with body, before `content = …`)
        const logMessage = textDocument.lineAt(naturalEditorLine(3)).text;
        expect(
          /print\(.*read_file.*handle.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
