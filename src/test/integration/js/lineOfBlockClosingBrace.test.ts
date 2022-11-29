import * as assert from 'assert';
import * as vscode from 'vscode';
import Mocha from 'mocha';
import { openDocument } from '../../helpers';
import { BracketType } from '../../../entities';
import { closingBracketLine } from '../../../utilities/closingBracketLine';

test('Determine the closing brace line num', async () => {
  await openDocument('../files/js/lineOfBlockClosingBrace.ts');
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    assert.strictEqual(
      closingBracketLine(
        activeTextEditor.document,
        0,
        BracketType.CURLY_BRACES,
      ),
      4,
    );
    assert.strictEqual(
      closingBracketLine(
        activeTextEditor.document,
        1,
        BracketType.CURLY_BRACES,
      ),
      3,
    );
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.closeActiveEditor',
      [],
    );
  });
});
