import { emptyBlockDebuggingMsg } from '../../../../../../debug-message/js/JSDebugMessage/helpers/emptyBlockDebuggingMsg';
import { Position } from 'vscode';
import {
  createMockTextEditorEdit,
  makeTextLine,
  makeTextDocument,
} from '../../../../../mocks/helpers/';

describe('emptyBlockDebuggingMsg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('transforms a named function with empty block', () => {
    const line = makeTextLine('function greet(x) {}');

    const textEditorEdit = createMockTextEditorEdit();

    const document = makeTextDocument(['function greet(x) {}']);

    emptyBlockDebuggingMsg(
      document,
      textEditorEdit,
      line,
      1,
      `console.log('🚀 ~ x:', x);`,
      '',
      2,
    );

    expect(textEditorEdit.delete).toHaveBeenCalledTimes(1);
    expect(textEditorEdit.insert).toHaveBeenCalledWith(
      new Position(1, 0),
      "function greet(x) {\n  console.log('🚀 ~ x:', x);\n}\n",
    );
  });
  it('transforms an arrow function with empty block', () => {
    const line = makeTextLine('const transform = (x) => {};');
    const editor = createMockTextEditorEdit();
    const document = makeTextDocument(['const transform = (x) => {};']);

    emptyBlockDebuggingMsg(
      document,
      editor,
      line,
      1,
      `console.log('🚀 ~ x:', x);`,
      '',
      2,
    );

    expect(editor.delete).toHaveBeenCalledTimes(1);
    expect(editor.insert).toHaveBeenCalledWith(
      new Position(1, 0),
      "const transform = (x) => {\n  console.log('🚀 ~ x:', x);\n}\n",
    );
  });
});
