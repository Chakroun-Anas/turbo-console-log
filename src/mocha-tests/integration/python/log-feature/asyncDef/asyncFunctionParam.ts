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
  describe('Async function parameter', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.PYTHON,
        'log-feature/asyncDef',
        'asyncFunctionParam.py',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should insert log inside the async function body and include the function name', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'asyncFunctionParam.py');
      if (activeTextEditor) {
        // Select `url` on line 3: `async def fetch_data(url):`
        //   `async def fetch_data(` = 21 chars → `url` at cols 22-24 (1-based)
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 22),
            new NaturalEditorPosition(3, 25),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.insertConsoleLog',
          [],
        );
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(4),
          ]),
        );
        const textDocument = activeTextEditor.document;
        // Log is inserted at line 4 (first line in the async function body)
        const logMessage = textDocument.lineAt(naturalEditorLine(4)).text;
        // The enclosing function name must be `fetch_data` (not `def` or blank,
        // which was the async-name bug fixed via findChild(VariableName))
        expect(
          /print\(.*fetch_data.*url.*\)/.test(logMessage),
        ).to.equal(true);
      }
    });
  });
};
