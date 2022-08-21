import { TextDocument, TextEditorEdit } from 'vscode';
import { BlockType, LocElement, Message } from '../entities';
import { LineCodeProcessing } from '../line-code-processing';

export abstract class DebugMessage {
  lineCodeProcessing: LineCodeProcessing;
  constructor(lineCodeProcessing: LineCodeProcessing) {
    this.lineCodeProcessing = lineCodeProcessing;
  }
  abstract msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    wrapLogMessage: boolean,
    logMessagePrefix: string,
    quote: string,
    addSemicolonInTheEnd: boolean,
    insertEnclosingClass: boolean,
    insertEnclosingFunction: boolean,
    insertEmptyLineBeforeLogMessage: boolean,
    insertEmptyLineAfterLogMessage: boolean,
    delemiterInsideMessage: string,
    includeFileNameAndLineNum: boolean,
    tabSize: number,
    logType: string,
    logFunction: string,
  ): void;
  abstract line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): number;
  abstract detectAll(
    document: TextDocument,
    delemiterInsideMessage: string,
    quote: string,
  ): Message[];
  abstract enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string;
  closingElementLine(
    document: TextDocument,
    lineNum: number,
    locElement: LocElement,
  ): number {
    const docNbrOfLines: number = document.lineCount;
    let closingElementFound = false;
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
    while (!closingElementFound && lineNum < docNbrOfLines - 1) {
      const currentLineText: string = document.lineAt(lineNum).text;
      const openedClosedElementOccurrences =
        this.locOpenedClosedElementOccurrences(currentLineText, locElement);
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
  locOpenedClosedElementOccurrences(
    loc: string,
    locElement: LocElement,
  ): { openedElementOccurrences: number; closedElementOccurrences: number } {
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
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
  lineText(document: TextDocument, line: number): string {
    return document.lineAt(line).text;
  }
  spacesBeforeLogMsg(
    document: TextDocument,
    selectedVarLine: number,
    logMsgLine: number,
  ): string {
    const selectedVarTextLine = document.lineAt(selectedVarLine);
    const logMsgTextLine = document.lineAt(logMsgLine);
    const selectedVarTextLineFirstNonWhitespaceCharacterIndex =
      selectedVarTextLine.firstNonWhitespaceCharacterIndex;
    const logMsgTextLineFirstNonWhitespaceCharacterIndex =
      logMsgTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeSelectedVarLine = selectedVarTextLine.text
      .split('')
      .splice(0, selectedVarTextLineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
    const spacesBeforeLogMsgLine = logMsgTextLine.text
      .split('')
      .splice(0, logMsgTextLineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
    return spacesBeforeSelectedVarLine.length > spacesBeforeLogMsgLine.length
      ? spacesBeforeSelectedVarLine
      : spacesBeforeLogMsgLine;
  }
  spacesBeforeLine(document: TextDocument, lineNumber: number): string {
    const textLine = document.lineAt(lineNumber);
    const lineFirstNonWhitespaceCharacterIndex =
      textLine.firstNonWhitespaceCharacterIndex;
    return textLine.text
      .split('')
      .splice(0, lineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
  }
}
