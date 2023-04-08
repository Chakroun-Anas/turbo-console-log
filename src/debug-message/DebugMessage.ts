import { TextDocument, TextEditorEdit } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  LogMessage,
  Message,
} from '../entities';
import { LineCodeProcessing } from '../line-code-processing';
import { DebugMessageLine } from './DebugMessageLine';

export abstract class DebugMessage {
  lineCodeProcessing: LineCodeProcessing;
  debugMessageLine: DebugMessageLine;
  constructor(
    lineCodeProcessing: LineCodeProcessing,
    debugMessageLine: DebugMessageLine,
  ) {
    this.lineCodeProcessing = lineCodeProcessing;
    this.debugMessageLine = debugMessageLine;
  }
  abstract logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): LogMessage;
  abstract msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void;
  abstract detectAll(
    document: TextDocument,
    logFunction: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[];
  abstract enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string;
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    return this.debugMessageLine.line(
      document,
      selectionLine,
      selectedVar,
      logMsg,
    );
  }
  spacesBeforeLogMsg(
    document: TextDocument,
    selectedVarLine: number,
    logMsgLine: number,
  ): string {
    const selectedVarTextLine = document.lineAt(selectedVarLine);
    const selectedVarTextLineFirstNonWhitespaceCharacterIndex =
      selectedVarTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeSelectedVarLine = selectedVarTextLine.text
      .split('')
      .splice(0, selectedVarTextLineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
    if (logMsgLine < document.lineCount) {
      const logMsgTextLine = document.lineAt(logMsgLine);
      const logMsgTextLineFirstNonWhitespaceCharacterIndex =
        logMsgTextLine.firstNonWhitespaceCharacterIndex;
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
    return spacesBeforeSelectedVarLine;
  }
}
