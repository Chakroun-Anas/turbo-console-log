import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  ZeroBasedPosition,
  zeroBasedLine,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Function passed as a promise callback', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'promiseAnonymousFunction.ts',
      );
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Insert log message correctly', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'promiseAnonymousFunction.ts',
      );
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(6, 9),
            new ZeroBasedPosition(6, 21),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            zeroBasedLine({ visualLine: 7 }),
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            activeTextEditor.document.lineAt(zeroBasedLine({ visualLine: 7 }))
              .text,
          ),
        ).to.equal(true);
        activeTextEditor.selections = [
          new vscode.Selection(
            new ZeroBasedPosition(8, 9),
            new ZeroBasedPosition(8, 29),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            zeroBasedLine({ visualLine: 9 }),
          ]),
        );
        expect(
          /console\.log\(.*/.test(
            activeTextEditor.document.lineAt(zeroBasedLine({ visualLine: 9 }))
              .text,
          ),
        ).to.equal(true);
      }
    });
  });
};
