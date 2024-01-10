import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  naturalEditorLine,
  NaturalEditorPosition,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Function inside a class', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/class',
        'classFunction.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert a log message related to parameter of a function inside a class', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'classFunction.js');
      const expectedLogMessageLine = naturalEditorLine(3);
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 12),
            new NaturalEditorPosition(2, 20),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            expectedLogMessageLine,
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(expectedLogMessageLine).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        // Class name
        expect(logMessage.includes('Person')).to.equal(true);
        // Function name
        expect(logMessage.includes('sayHello')).to.equal(true);
      }
    });
  });
};
