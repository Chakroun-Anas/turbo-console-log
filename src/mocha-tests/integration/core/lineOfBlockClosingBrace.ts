import * as vscode from 'vscode';
import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import { openDocument, expectActiveTextEditorWithFile } from '../helpers';
import { BracketType } from '../../../entities';
import { closingContextLine } from '../../../utilities/closingContextLine';

export default (): void => {
  describe('Determine the closing brace line num', () => {
    Mocha.before(async () => {
      await openDocument('', 'core', 'lineOfBlockClosingBrace.ts');
    });
    Mocha.after(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should determine the closing brace line num correctly', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(
        activeTextEditor,
        'lineOfBlockClosingBrace.ts',
      );
      if (activeTextEditor) {
        expect(
          closingContextLine(
            activeTextEditor.document,
            0,
            BracketType.CURLY_BRACES,
          ),
        ).to.equal(4);
        expect(
          closingContextLine(
            activeTextEditor.document,
            1,
            BracketType.CURLY_BRACES,
          ),
        ).to.equal(3);
      }
    });
  });
};
