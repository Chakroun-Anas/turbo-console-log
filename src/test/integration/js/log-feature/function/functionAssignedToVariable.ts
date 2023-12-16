import * as vscode from 'vscode';
import Mocha, { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  zeroBasedLine,
  ZeroBasedPosition,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Function assigned to a variable', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'functionAssignedToVariable.ts',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should log a named function assigned to a variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'functionAssignedToVariable.ts',
      );
      const expectedLogMessageLine = zeroBasedLine({ visualLine: 6 });
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(3, 7),
          new ZeroBasedPosition(3, 20),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            expectedLogMessageLine,
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(expectedLogMessageLine).text,
          ),
        ).to.equal(true);
      }
    });
    it('Should log an anonymous function assigned to a variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'functionAssignedToVariable.ts',
      );
      const expectedLogMessageLine = zeroBasedLine({ visualLine: 10 });
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(7, 7),
          new ZeroBasedPosition(7, 24),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            expectedLogMessageLine,
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(expectedLogMessageLine).text,
          ),
        ).to.equal(true);
      }
    });
    it('Should log an anonymous function assigned to a variable with multiple parameters', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'functionAssignedToVariable.ts',
      );
      const expectedLogMessageLine = zeroBasedLine({ visualLine: 17 });
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(11, 7),
          new ZeroBasedPosition(11, 34),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            expectedLogMessageLine,
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(expectedLogMessageLine).text,
          ),
        ).to.equal(true);
      }
    });
    it('Should log a parameter of a function assigned to a variable', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'functionAssignedToVariable.ts',
      );
      const expectedLogMessageLine = zeroBasedLine({ visualLine: 19 });
      if (activeTextEditor) {
        const textDocument = activeTextEditor.document;
        activeTextEditor.selection = new vscode.Selection(
          new ZeroBasedPosition(18, 22),
          new ZeroBasedPosition(18, 27),
        );
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            expectedLogMessageLine,
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            textDocument.lineAt(expectedLogMessageLine).text,
          ),
        ).to.equal(true);
      }
    });
  });
};
