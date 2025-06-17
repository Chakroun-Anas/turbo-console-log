import * as vscode from 'vscode';
import Mocha, { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  naturalEditorLine,
  NaturalEditorPosition,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../../helpers';
import { ProgrammingLanguage } from '../../../../../../entities';

export default (): void => {
  describe('Nullish Assignment', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/operator/nullish',
        'assignment.ts',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should log ternary assignment variable rightly', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'assignment.ts');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 7),
            new NaturalEditorPosition(2, 27),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(7),
          ]),
        );
        const textDocument = activeTextEditor.document;
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(naturalEditorLine(7)).text,
          ),
        ).to.equal(true);
      }
    });
  });
};
