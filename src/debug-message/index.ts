import { TextDocument } from "vscode";
import { BlockType, Message } from "../entities";
import { LineCodeProcessing } from "../line-code-processing";

export interface DebugMessage {
  lineCodeProcessing: LineCodeProcessing;
  content(
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
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string
  ): number;
  spacesBefore(document: TextDocument, line: number, tabSize: number): string;
  detectAll(
    document: TextDocument,
    tabSize: number,
    logMessagePrefix: string
  ): Message[];
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType
  ): string;
  blockClosingBraceLine(document: TextDocument, lineNum: number): number;
}
