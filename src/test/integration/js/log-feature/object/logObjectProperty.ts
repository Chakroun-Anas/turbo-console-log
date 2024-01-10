import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import * as vscode from 'vscode';
import {
  openDocument,
  NaturalEditorPosition,
  naturalEditorLine,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../entities';

export default (): void => {
  describe('Object property', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/object',
        'logObjectProperty.js',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should handles log message related to an object property (one level)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logObjectProperty.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 5),
            new NaturalEditorPosition(3, 8),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        // Console log message is appended to the end of the document starting with /n character
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(10)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage).to.includes('person.age');
      }
    });
    it('Should handles log message related to an object property (two levels)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logObjectProperty.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(5, 9),
            new NaturalEditorPosition(5, 15),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        // Console log message is appended to the end of the document starting with /n character
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(10)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage).to.includes('person.family.mother');
      }
    });
    it('Should handles log message related to an object property (three levels)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logObjectProperty.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(6, 13),
            new NaturalEditorPosition(6, 22),
          ),
        ];
        await vscode.commands.executeCommand(
          'turboConsoleLog.displayLogMessage',
          [],
        );
        // Console log message is appended to the end of the document starting with /n character
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(10)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage).to.includes('person.family.mother.firstName');
      }
    });
  });
};
