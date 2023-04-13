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
  describe('Function parameter', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'oneLineFunctionParam.js',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Insert log message related to a function parameter defined in one line', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'oneLineFunctionParam.js',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new vscode.Position(0, 18),
            new vscode.Position(0, 26),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(documentLinesChanged(activeTextEditor.document, [1]));
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(1).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage.includes('sayHello')).to.equal(true);
      }
    });
  });
};
