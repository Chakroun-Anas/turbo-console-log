import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  NaturalEditorPosition,
  naturalEditorLine,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Nested functions inside a class', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/class',
        'classNestedFunctions.js',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert a log message related to a parameter of a function declared within another function in a class', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'classNestedFunctions.js',
      );
      const expectedLogMessageLine = naturalEditorLine(4);
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 30),
            new NaturalEditorPosition(3, 42),
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
        expect(logMessage.includes('anotherFunction')).to.equal(true);
        // Variable name
        expect(logMessage.includes('anotherParam')).to.equal(true);
      }
    });
  });
};
