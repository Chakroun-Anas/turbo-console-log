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
  describe('Logging warning command', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/loggingCommand',
        'loggingWarning.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert logging.warning and auto-add `import logging` when not present', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'loggingWarning.py');
      if (activeTextEditor) {
        // Select `result` on line 2: `    result = a + b`
        //   `    ` = 4 chars → `result` at cols 5-10 (1-based)
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(2, 5),
            new NaturalEditorPosition(2, 11),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleWarn',
          [],
        );
        // Both inserts happen in the same edit batch. Wait for the import line
        // (original line 0 = start of file) which fires in the same event as the log.
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(1),
          ]),
        );
        const textDocument = activeTextEditor.document;
        // After insert the file is:
        //   line 1: import logging          ← auto-added
        //   line 2: def calculate(a, b):
        //   line 3:     result = a + b
        //   line 4:     logging.warning(…)  ← the log
        //   line 5:     return result
        const importLine = textDocument.lineAt(naturalEditorLine(1)).text;
        expect(importLine.trim()).to.equal('import logging');

        const logMessage = textDocument.lineAt(naturalEditorLine(4)).text;
        expect(
          /logging\.warning\(.*calculate.*result.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
