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
  describe('Variable getting its value from a function call', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/variable',
        'valueFromFunctionCall.ts',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Case 1', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'valueFromFunctionCall.ts',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(4, 9),
            new NaturalEditorPosition(4, 19),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            activeTextEditor.document.lineAt(naturalEditorLine(9)).text,
          ),
        ).to.equal(true);
      }
    });
  });
};
