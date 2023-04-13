import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Deconstruction variables creation', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/variable',
        'deconstructionVarAssignment.tsx',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert a log message related to a deconstructed property of an object', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'deconstructionVarAssignment.tsx',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(13, 5),
            new vscode.Position(13, 13),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [20]),
        );
        expect(
          /console\.log\(.*/.test(activeTextEditor.document.lineAt(20).text),
        ).to.equal(true);
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(25, 11),
            new vscode.Position(25, 15),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [26]),
        );
        expect(
          /console\.log\(.*/.test(activeTextEditor.document.lineAt(26).text),
        ).to.equal(true);
      }
    });
  });
};
