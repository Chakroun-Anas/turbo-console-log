import { TextDocument } from "vscode";
import { BlockType, Message } from "../entities";
import { LineCodeProcessing } from "../line-code-processing";

export abstract class DebugMessage {
  lineCodeProcessing: LineCodeProcessing;
  constructor(lineCodeProcessing: LineCodeProcessing) {
    this.lineCodeProcessing = lineCodeProcessing;
  }
  abstract content(
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    wrapLogMessage: boolean,
    logMessagePrefix: string,
    quote: string,
    addSemicolonInTheEnd: boolean,
    insertEnclosingClass: boolean,
    insertEnclosingFunction: boolean,
    tabSize: number
  ): string;
  abstract line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string
  ): number;
  abstract spacesBefore(
    document: TextDocument,
    line: number,
    tabSize: number
  ): string;
  abstract detectAll(
    document: TextDocument,
    tabSize: number,
    logMessagePrefix: string
  ): Message[];
  abstract enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType
  ): string;
  blockClosingBraceLine(document: TextDocument, lineNum: number): number {
    const docNbrOfLines: number = document.lineCount;
    let enclosingBracketFounded: boolean = false;
    let nbrOfOpeningBrackets: number = 1;
    let nbrOfClosingBrackets: number = 0;
    while (!enclosingBracketFounded && lineNum < docNbrOfLines - 1) {
      lineNum++;
      const currentLineText: string = document.lineAt(lineNum).text;
      const openedBrackets: RegExp = /{/g;
      while (openedBrackets.exec(currentLineText)) {
        nbrOfOpeningBrackets++;
      }
      const closedBrackets: RegExp = /}/g;
      while (closedBrackets.exec(currentLineText)) {
        nbrOfClosingBrackets++;
      }
      if (nbrOfOpeningBrackets === nbrOfClosingBrackets) {
        enclosingBracketFounded = true;
        return lineNum;
      }
    }
    return lineNum;
  }
}
