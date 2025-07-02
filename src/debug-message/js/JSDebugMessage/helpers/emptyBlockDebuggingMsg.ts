import { TextDocument, TextEditorEdit, TextLine, Position } from 'vscode';
import { EMPTY_BLOCK_REGEX } from './regexContants';

export function emptyBlockDebuggingMsg(
  document: TextDocument,
  textEditor: TextEditorEdit,
  emptyBlockLine: TextLine,
  logMsgLine: number,
  debuggingMsg: string,
  spacesBeforeMsg: string,
  tabSize: number,
): void {
  // Only run when we’re sure it’s an empty block  {}
  if (EMPTY_BLOCK_REGEX.test(emptyBlockLine.text.replace(/\s/g, ''))) {
    /* --------------------------------------------------------------
       1.  Grab EVERYTHING that comes before the first “{”
           – Works for:
             • function foo() { }
             • const bar = (x) => { }
             • async (y) => { }
    -------------------------------------------------------------- */
    const braceIndex = emptyBlockLine.text.indexOf('{');
    const textBeforeBrace =
      braceIndex !== -1
        ? emptyBlockLine.text.slice(0, braceIndex).trimEnd()
        : emptyBlockLine.text.trimEnd(); // fallback (shouldn’t happen)

    /* --------------------------------------------------------------
       2.  Prepare indentation:
           base indent (spacesBeforeMsg) + one tabSize level
    -------------------------------------------------------------- */
    const fullIndent = spacesBeforeMsg + ' '.repeat(tabSize);

    /* --------------------------------------------------------------
       3.  Delete the “{}” line and insert the rebuilt block
    -------------------------------------------------------------- */
    textEditor.delete(emptyBlockLine.rangeIncludingLineBreak);
    textEditor.insert(
      new Position(
        logMsgLine >= document.lineCount ? document.lineCount : logMsgLine,
        0,
      ),
      `${textBeforeBrace} {\n${fullIndent}${debuggingMsg}\n${spacesBeforeMsg}}\n`,
    );
  }
}
