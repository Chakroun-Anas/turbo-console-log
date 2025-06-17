import { TextEditor } from 'vscode';
import { expect } from 'chai';

/**
 * Ensure that activeTextEditor is defined and that the current opened document reflects the testFileName
 * @param activeTextEditor TextEditor | undefined
 * @param testFileName string
 */
export const expectActiveTextEditorWithFile = (
  activeTextEditor: TextEditor | undefined,
  testFileName: string,
): void => {
  expect(activeTextEditor).to.not.equal(undefined);
  expect(activeTextEditor?.document.fileName.endsWith(testFileName)).to.equal(
    true,
  );
};
