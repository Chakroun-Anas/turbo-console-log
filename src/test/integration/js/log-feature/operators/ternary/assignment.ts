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
  describe('Ternary Assignment', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/operator/ternary',
        'assignment.ts',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should log ternary assignment in a relatively simple case', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'assignment.ts');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 7),
            new NaturalEditorPosition(3, 10),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(6),
          ]),
        );
        const textDocument = activeTextEditor.document;
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(naturalEditorLine(6)).text,
          ),
        ).to.equal(true);
      }
    });
    it('Should log ternary assignment in a complex case', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'assignment.ts');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(7, 14),
            new NaturalEditorPosition(7, 15),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(24),
          ]),
        );
        const textDocument = activeTextEditor.document;
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(naturalEditorLine(25)).text,
          ),
        ).to.equal(true);
      }
    });
  });
};
