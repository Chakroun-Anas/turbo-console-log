import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
  NaturalEditorPosition,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Parameter of a class constructor', () => {
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert a log message related to a class constructor param', async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/class',
        'classConstructor.js',
      );
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'classConstructor.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 15),
            new NaturalEditorPosition(2, 23),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(documentLinesChanged(activeTextEditor.document, [2]));
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(2).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        // Class name
        expect(logMessage.includes('Person')).to.equal(true);
        // Function name
        expect(logMessage.includes('constructor')).to.equal(true);
      }
    });
  });
};
