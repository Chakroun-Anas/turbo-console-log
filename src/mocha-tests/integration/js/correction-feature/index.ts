import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  openDocument,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
  naturalEditorLine,
} from '../../helpers';
import { ProgrammingLanguage } from '../../../../entities';

export default (): void => {
  describe('Correct all log types filename and line number metadata (console.log, console.warn, console.error, console.debug, console.info, console.table, myLogger)', () => {
    Mocha.before(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'correction-feature',
        'allLogTypes.ts',
      );
    });

    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });

    it('Should update outdated log messages with the correct filename and line number for all log types', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'allLogTypes.ts');

      if (activeTextEditor) {
        const document = activeTextEditor.document;
        const currentFileName = document.fileName.split('/').pop() ?? '';

        // Get initial document content to verify outdated metadata
        const initialDocumentText = document.getText();

        // Verify we have the expected outdated log patterns before correction
        expect(
          initialDocumentText.includes('🚀 ~ oldFile.js:5 ~ userData:'),
        ).to.equal(true);
        expect(
          initialDocumentText.includes(
            '🚀 ~ oldFile.js:8 ~ processUser ~ user:',
          ),
        ).to.equal(true);
        expect(
          initialDocumentText.includes(
            '🚀 ~ oldFile.js:11 ~ processUser ~ missing email:',
          ),
        ).to.equal(true);
        expect(
          initialDocumentText.includes(
            '🚀 ~ oldFile.js:15 ~ processUser ~ processing user:',
          ),
        ).to.equal(true);
        expect(
          initialDocumentText.includes(
            '🚀 ~ oldFile.js:20 ~ processUser ~ result:',
          ),
        ).to.equal(true);
        expect(
          initialDocumentText.includes(
            '🚀 ~ oldFile.js:21 ~ processUser ~ table data:',
          ),
        ).to.equal(true);
        expect(
          initialDocumentText.includes(
            '🚀 ~ index.ts:86 ~ processUser ~ custom log:',
          ),
        ).to.equal(true);
        expect(
          initialDocumentText.includes('🚀 ~ oldFile.js:30 ~ processedUser:'),
        ).to.equal(true);

        // Expected line numbers where log messages are located (0-indexed for VS Code API)
        const logMessageLines = [
          naturalEditorLine(10), // console.log('🚀 ~ oldFile.js:5 ~ userData:', userData);
          naturalEditorLine(14), // console.warn('🚀 ~ oldFile.js:8 ~ processUser ~ user:', user);
          naturalEditorLine(18), // console.error('🚀 ~ oldFile.js:11 ~ processUser ~ missing email:', user);
          naturalEditorLine(23), // console.info('🚀 ~ oldFile.js:15 ~ processUser ~ processing user:', user);
          naturalEditorLine(31), // console.debug('🚀 ~ oldFile.js:20 ~ processUser ~ result:', result);
          naturalEditorLine(33), // console.table('🚀 ~ oldFile.js:21 ~ processUser ~ table data:', result);
          naturalEditorLine(35), // myLogger('🚀 ~ index.ts:86 ~ processUser ~ custom log:', result);
          naturalEditorLine(42), // console.log('🚀 ~ oldFile.js:30 ~ processedUser:', processedUser);
          naturalEditorLine(45), // console.log('🚀 ~ oldFile.js:35 ~ multi-line log:', {
          naturalEditorLine(50), // myLogger('🚀 ~ index.ts:89 ~ multi-line custom log:', processedUser);
        ];

        // Execute correct all log messages command
        await vscode.commands.executeCommand(
          'turboConsoleLog.correctAllLogMessages',
          [],
        );

        // Wait for the document to reflect changes
        await Promise.all(documentLinesChanged(document, logMessageLines));

        // Verify that each log message line has been corrected
        for (const logMessageLine of logMessageLines) {
          const lineText = document
            .lineAt(logMessageLine)
            .text.replace(/\s/g, '');

          // Check if the filename has been corrected to current filename
          expect(lineText).to.include(
            currentFileName,
            `Line ${logMessageLine + 1} should contain correct filename: ${currentFileName}`,
          );

          // Check if the line number has been corrected to actual line number (1-indexed)
          expect(lineText).to.match(
            new RegExp(`:${logMessageLine + 1}`),
            `Line ${logMessageLine + 1} should contain correct line number: ${logMessageLine + 1}`,
          );

          // Verify the old filename is no longer present
          expect(lineText).to.not.include(
            'oldFile.js',
            `Line ${logMessageLine + 1} should not contain old filename`,
          );
        }
      }
    });
  });
};
