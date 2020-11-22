import { open } from "fs";
import { TextDocument } from "vscode";
import { BlockType, LocElement, Message } from "../entities";
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
    delemiterInsideMessage: string,
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
  closingElementLine(
    document: TextDocument,
    lineNum: number,
    locElement: LocElement
  ): number {
    const docNbrOfLines: number = document.lineCount;
    let closingElementFound: boolean = false;
    let openedElementOccurrences: number = 0;
    let closedElementOccurrences: number = 0;
    while (!closingElementFound && lineNum < docNbrOfLines - 1) {
      const currentLineText: string = document.lineAt(lineNum).text;
      const openedClosedElementOccurrences = this.locOpenedClosedElementOccurrences(
        currentLineText,
        locElement
      );
      openedElementOccurrences +=
        openedClosedElementOccurrences.openedElementOccurrences;
      closedElementOccurrences +=
        openedClosedElementOccurrences.closedElementOccurrences;
      if (openedElementOccurrences === closedElementOccurrences) {
        closingElementFound = true;
        return lineNum;
      }
      lineNum++;
    }
    return lineNum;
  }
  locOpenedClosedElementOccurrences(loc: string, locElement: LocElement) {
    let openedElementOccurrences: number = 0;
    let closedElementOccurrences: number = 0;
    const openedElement: RegExp =
      locElement === LocElement.Parenthesis ? /\(/g : /{/g;
    const closedElement: RegExp =
      locElement === LocElement.Parenthesis ? /\)/g : /}/g;
    while (openedElement.exec(loc)) {
      openedElementOccurrences++;
    }
    while (closedElement.exec(loc)) {
      closedElementOccurrences++;
    }
    return {
      openedElementOccurrences,
      closedElementOccurrences,
    };
  }
}
