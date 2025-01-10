import { TextDocument, TextEditorEdit, TextLine, Position } from 'vscode';

export function emptyBlockDebuggingMsg(
  document: TextDocument,
  textEditor: TextEditorEdit,
  emptyBlockLine: TextLine,
  logMsgLine: number,
  debuggingMsg: string,
  spacesBeforeMsg: string,
): void {
  if (/\){.*}/.test(emptyBlockLine.text.replace(/\s/g, ''))) {
    const textBeforeClosedFunctionParenthesis =
      emptyBlockLine.text.split(')')[0];
    textEditor.delete(emptyBlockLine.rangeIncludingLineBreak);
    textEditor.insert(
      new Position(
        logMsgLine >= document.lineCount ? document.lineCount : logMsgLine,
        0,
      ),
      `${textBeforeClosedFunctionParenthesis}) {\n${
        logMsgLine === document.lineCount ? '\n' : ''
      }${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}}\n`,
    );
  }
}
