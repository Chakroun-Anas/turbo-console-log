import * as vscode from 'vscode';
import Mocha, { describe, it } from 'mocha';
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
  describe('Anonymous Functions', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/function',
        'anonymousFunctions.ts',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    describe('Anonymous function defined in a single line', () => {
      describe('Transform and log message related to the function parameter', () => {
        it('Should transform and log message related to an assignment', async () => {
          const { activeTextEditor } = vscode.window;
          expectActiveTextEditorWithFile(
            activeTextEditor,
            'anonymousFunctions.ts',
          );
          if (activeTextEditor) {
            activeTextEditor.selections = [
              new vscode.Selection(
                new NaturalEditorPosition(3, 29),
                new NaturalEditorPosition(3, 37),
              ),
            ];
            await vscode.commands.executeCommand(
              'turboConsoleLog.displayLogMessage',
              [],
            );
            await Promise.all(
              documentLinesChanged(activeTextEditor.document, [2]),
            );
            const textDocument = activeTextEditor.document;
            expect(
              /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(3)).text),
            ).to.equal(true);
            expect(
              /console\.log\(.*/.test(
                textDocument.lineAt(naturalEditorLine(4)).text,
              ),
            ).to.equal(true);
            expect(
              /return /.test(textDocument.lineAt(naturalEditorLine(5)).text),
            ).to.equal(true);
          }
        });
        it('Should transform and log message related to a function passed as a parameter', async () => {
          const { activeTextEditor } = vscode.window;
          expectActiveTextEditorWithFile(
            activeTextEditor,
            'anonymousFunctions.ts',
          );
          if (activeTextEditor) {
            activeTextEditor.selections = [
              new vscode.Selection(
                new NaturalEditorPosition(5, 14),
                new NaturalEditorPosition(5, 20),
              ),
            ];
            await vscode.commands.executeCommand(
              'turboConsoleLog.displayLogMessage',
              [],
            );
            await Promise.all(
              documentLinesChanged(activeTextEditor.document, [4]),
            );
            const textDocument = activeTextEditor.document;
            expect(
              /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(5)).text),
            ).to.equal(true);
            expect(
              /console\.log\(.*/.test(
                textDocument.lineAt(naturalEditorLine(6)).text,
              ),
            ).to.equal(true);
            expect(
              /return member.include\('S'\)/.test(
                textDocument.lineAt(naturalEditorLine(7)).text,
              ),
            ).to.equal(true);
            expect(
              /}\)/.test(textDocument.lineAt(naturalEditorLine(8)).text),
            ).to.equal(true);
          }
        });
        it('Should transform and log message related to function passed as parameter in chained functions call context', async () => {
          const { activeTextEditor } = vscode.window;
          expectActiveTextEditorWithFile(
            activeTextEditor,
            'anonymousFunctions.ts',
          );
          if (activeTextEditor) {
            activeTextEditor.selections = [
              new vscode.Selection(
                new NaturalEditorPosition(8, 14),
                new NaturalEditorPosition(8, 18),
              ),
            ];
            await vscode.commands.executeCommand(
              'turboConsoleLog.displayLogMessage',
              [],
            );
            await Promise.all(
              documentLinesChanged(activeTextEditor.document, [7]),
            );
            const textDocument = activeTextEditor.document;
            expect(
              /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(8)).text),
            ).to.equal(true);
            expect(
              /console\.log\(.*/.test(
                textDocument.lineAt(naturalEditorLine(9)).text,
              ),
            ).to.equal(true);
            expect(
              /return item.index !== original.index/.test(
                textDocument.lineAt(naturalEditorLine(10)).text,
              ),
            ).to.equal(true);
            expect(
              /}\)/.test(textDocument.lineAt(naturalEditorLine(11)).text),
            ).to.equal(true);
          }
        });
      });
    });
    describe('Anonymous function defined in multiple lines', () => {
      it('Example 01', async () => {
        const { activeTextEditor } = vscode.window;
        expectActiveTextEditorWithFile(
          activeTextEditor,
          'anonymousFunctions.ts',
        );
        if (activeTextEditor) {
          activeTextEditor.selections = [
            new vscode.Selection(
              new NaturalEditorPosition(12, 16),
              new NaturalEditorPosition(12, 22),
            ),
          ];
          await vscode.commands.executeCommand(
            'turboConsoleLog.displayLogMessage',
            [],
          );
          await Promise.all(
            documentLinesChanged(activeTextEditor.document, [11, 12, 13]),
          );
          const textDocument = activeTextEditor.document;
          expect(
            /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(12)).text),
          ).to.equal(true);
          expect(
            /console\.log\(.*/.test(
              textDocument.lineAt(naturalEditorLine(13)).text,
            ),
          ).to.equal(true);
          expect(
            /return checkAccountingPeriodDivide\(budget._id, accountingPeriodId\)/.test(
              textDocument.lineAt(naturalEditorLine(14)).text,
            ),
          ).to.equal(true);
          expect(
            /}\)/.test(textDocument.lineAt(naturalEditorLine(15)).text),
          ).to.equal(true);
        }
      });
      it('Example 02', async () => {
        const { activeTextEditor } = vscode.window;
        expectActiveTextEditorWithFile(
          activeTextEditor,
          'anonymousFunctions.ts',
        );
        if (activeTextEditor) {
          activeTextEditor.selections = [
            new vscode.Selection(
              new NaturalEditorPosition(19, 16),
              new NaturalEditorPosition(19, 22),
            ),
          ];
          await vscode.commands.executeCommand(
            'turboConsoleLog.displayLogMessage',
            [],
          );
          await Promise.all(
            documentLinesChanged(activeTextEditor.document, [18, 19, 20]),
          );
          const textDocument = activeTextEditor.document;
          expect(
            /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(19)).text),
          ).to.equal(true);
          expect(
            /console\.log\(.*/.test(
              textDocument.lineAt(naturalEditorLine(20)).text,
            ),
          ).to.equal(true);
          expect(
            /return checkAccountingPeriodDivide\(budget._id\)/.test(
              textDocument.lineAt(naturalEditorLine(21)).text,
            ),
          ).to.equal(true);
          expect(
            /}\)/.test(textDocument.lineAt(naturalEditorLine(23)).text),
          ).to.equal(true);
        }
      });
      it('Example 03', async () => {
        const { activeTextEditor } = vscode.window;
        expectActiveTextEditorWithFile(
          activeTextEditor,
          'anonymousFunctions.ts',
        );
        if (activeTextEditor) {
          activeTextEditor.selections = [
            new vscode.Selection(
              new NaturalEditorPosition(27, 18),
              new NaturalEditorPosition(27, 24),
            ),
          ];
          await vscode.commands.executeCommand(
            'turboConsoleLog.displayLogMessage',
            [],
          );
          await Promise.all(
            documentLinesChanged(activeTextEditor.document, [26, 27, 28]),
          );
          const textDocument = activeTextEditor.document;
          expect(
            /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(27)).text),
          ).to.equal(true);
          expect(
            /console\.log\(.*/.test(
              textDocument.lineAt(naturalEditorLine(28)).text,
            ),
          ).to.equal(true);
          expect(
            /return checkAccountingPeriodDivide\(budget._id, accountingPeriodId\)/.test(
              textDocument.lineAt(naturalEditorLine(29)).text,
            ),
          ).to.equal(true);
          expect(
            /}\)/.test(textDocument.lineAt(naturalEditorLine(30)).text),
          ).to.equal(true);
        }
      });
      it('Example 04', async () => {
        const { activeTextEditor } = vscode.window;
        expectActiveTextEditorWithFile(
          activeTextEditor,
          'anonymousFunctions.ts',
        );
        if (activeTextEditor) {
          activeTextEditor.selections = [
            new vscode.Selection(
              new NaturalEditorPosition(35, 18),
              new NaturalEditorPosition(35, 24),
            ),
          ];
          await vscode.commands.executeCommand(
            'turboConsoleLog.displayLogMessage',
            [],
          );
          await Promise.all(
            documentLinesChanged(activeTextEditor.document, [34, 35, 36]),
          );
          const textDocument = activeTextEditor.document;
          expect(
            /\{\s*$/.test(textDocument.lineAt(naturalEditorLine(35)).text),
          ).to.equal(true);
          expect(
            /console\.log\(.*/.test(
              textDocument.lineAt(naturalEditorLine(36)).text,
            ),
          ).to.equal(true);
          expect(
            /return checkAccountingPeriodDivide\(budget._id\)/.test(
              textDocument.lineAt(naturalEditorLine(37)).text,
            ),
          ).to.equal(true);
          expect(
            /}\)/.test(textDocument.lineAt(naturalEditorLine(39)).text),
          ).to.equal(true);
        }
      });
    });
  });
};
