import { TextDocument } from 'vscode';
import {
  BracketType,
  LogContextMetadata,
  LogMessage,
  LogMessageType,
} from '../../entities';
import { DebugMessageLine } from '../DebugMessageLine';
import { getMultiLineContextVariable } from '../../utilities';
import { LineCodeProcessing } from '../../line-code-processing';

export class JSDebugMessageLine implements DebugMessageLine {
  lineCodeProcessing: LineCodeProcessing;
  constructor(lineCodeProcessing: LineCodeProcessing) {
    this.lineCodeProcessing = lineCodeProcessing;
  }
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    switch (logMsg.logMessageType) {
      case LogMessageType.ObjectLiteral:
        return this.objectLiteralLine(document, selectionLine);
      case LogMessageType.NamedFunctionAssignment:
        return this.functionAssignmentLine(
          document,
          selectionLine,
          selectedVar,
        );
      case LogMessageType.Decorator:
        return (
          (getMultiLineContextVariable(
            document,
            selectionLine,
            BracketType.PARENTHESIS,
            false,
          )?.closingContextLine || selectionLine) + 1
        );
      case LogMessageType.MultiLineAnonymousFunction:
        return (
          this.functionClosedLine(
            document,
            selectionLine,
            BracketType.CURLY_BRACES,
          ) + 1
        );
      case LogMessageType.ObjectFunctionCallAssignment:
        return this.objectFunctionCallLine(
          document,
          selectionLine,
          selectedVar,
        );
      case LogMessageType.ArrayAssignment:
        return this.arrayLine(document, selectionLine);
      case LogMessageType.MultilineParenthesis:
        return (
          ((logMsg?.metadata as LogContextMetadata)?.closingContextLine ||
            selectionLine) + 1
        );
      case LogMessageType.Ternary:
        return this.templateStringLine(document, selectionLine);
      case LogMessageType.MultilineBraces:
        // Deconstructing assignment
        if ((logMsg?.metadata as LogContextMetadata)?.closingContextLine) {
          return (
            (logMsg?.metadata as LogContextMetadata)?.closingContextLine + 1
          );
        }
        return selectionLine + 1;
      default:
        return selectionLine + 1;
    }
  }
  private objectLiteralLine(
    document: TextDocument,
    selectionLine: number,
  ): number {
    const currentLineText: string = document.lineAt(selectionLine).text;
    let nbrOfOpenedBrackets: number = (currentLineText.match(/{/g) || [])
      .length;
    let nbrOfClosedBrackets: number = (currentLineText.match(/}/g) || [])
      .length;
    let currentLineNum: number = selectionLine + 1;
    while (currentLineNum < document.lineCount) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      nbrOfOpenedBrackets += (currentLineText.match(/{/g) || []).length;
      nbrOfClosedBrackets += (currentLineText.match(/}/g) || []).length;
      currentLineNum++;
      if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
        break;
      }
    }
    return nbrOfClosedBrackets === nbrOfOpenedBrackets
      ? currentLineNum
      : selectionLine + 1;
  }
  private functionAssignmentLine(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): number {
    const currentLineText = document.lineAt(selectionLine).text;
    if (/{/.test(currentLineText)) {
      if (
        document.lineAt(selectionLine).text.split('=')[1].includes(selectedVar)
      ) {
        return selectionLine + 1;
      }
      return (
        this.closingElementLine(
          document,
          selectionLine,
          BracketType.CURLY_BRACES,
        ) + 1
      );
    } else {
      const closedParenthesisLine = this.closingElementLine(
        document,
        selectionLine,
        BracketType.PARENTHESIS,
      );
      return (
        this.closingElementLine(
          document,
          closedParenthesisLine,
          BracketType.CURLY_BRACES,
        ) + 1
      );
    }
  }
  /**
   * Log line of a variable in multiline context (function parameter, or deconstructed object, etc.)
   */
  private functionClosedLine(
    document: TextDocument,
    declarationLine: number,
    bracketType: BracketType,
  ): number {
    let nbrOfOpenedBraces = 0;
    let nbrOfClosedBraces = 0;
    while (declarationLine < document.lineCount) {
      const { openedElementOccurrences, closedElementOccurrences } =
        this.locOpenedClosedElementOccurrences(
          document.lineAt(declarationLine).text,
          bracketType,
        );
      nbrOfOpenedBraces += openedElementOccurrences;
      nbrOfClosedBraces += closedElementOccurrences;
      if (nbrOfOpenedBraces - nbrOfClosedBraces === 0) {
        return declarationLine;
      }
      declarationLine++;
    }
    return -1;
  }
  private objectFunctionCallLine(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): number {
    let currentLineText: string = document.lineAt(selectionLine).text;
    let nextLineText: string = document
      .lineAt(selectionLine + 1)
      .text.replace(/\s/g, '');
    if (
      /\((\s*)$/.test(currentLineText.split(selectedVar)[0]) ||
      /,(\s*)$/.test(currentLineText.split(selectedVar)[0])
    ) {
      return selectionLine + 1;
    }
    let totalOpenedParenthesis = 0;
    let totalClosedParenthesis = 0;
    const { openedElementOccurrences, closedElementOccurrences } =
      this.locOpenedClosedElementOccurrences(
        currentLineText,
        BracketType.PARENTHESIS,
      );
    totalOpenedParenthesis += openedElementOccurrences;
    totalClosedParenthesis += closedElementOccurrences;
    let currentLineNum = selectionLine + 1;
    if (
      totalOpenedParenthesis !== totalClosedParenthesis ||
      currentLineText.endsWith('.') ||
      nextLineText.trim().startsWith('.')
    ) {
      while (currentLineNum < document.lineCount) {
        currentLineText = document.lineAt(currentLineNum).text;
        const { openedElementOccurrences, closedElementOccurrences } =
          this.locOpenedClosedElementOccurrences(
            currentLineText,
            BracketType.PARENTHESIS,
          );
        totalOpenedParenthesis += openedElementOccurrences;
        totalClosedParenthesis += closedElementOccurrences;
        if (currentLineNum === document.lineCount - 1) {
          break;
        }
        nextLineText = document.lineAt(currentLineNum + 1).text;
        currentLineNum++;
        if (
          totalOpenedParenthesis === totalClosedParenthesis &&
          !currentLineText.endsWith('.') &&
          !nextLineText.trim().startsWith('.')
        ) {
          break;
        }
      }
    }
    return totalOpenedParenthesis === totalClosedParenthesis
      ? currentLineNum
      : selectionLine + 1;
  }
  private arrayLine(document: TextDocument, selectionLine: number): number {
    const currentLineText: string = document.lineAt(selectionLine).text;
    let nbrOfOpenedBrackets: number = (currentLineText.match(/\[/g) || [])
      .length;
    let nbrOfClosedBrackets: number = (currentLineText.match(/\]/g) || [])
      .length;
    let currentLineNum: number = selectionLine + 1;
    if (nbrOfOpenedBrackets !== nbrOfClosedBrackets) {
      while (currentLineNum < document.lineCount) {
        const currentLineText: string = document.lineAt(currentLineNum).text;
        nbrOfOpenedBrackets += (currentLineText.match(/\[/g) || []).length;
        nbrOfClosedBrackets += (currentLineText.match(/\]/g) || []).length;
        currentLineNum++;
        if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
          break;
        }
      }
    }
    return nbrOfOpenedBrackets === nbrOfClosedBrackets
      ? currentLineNum
      : selectionLine + 1;
  }
  private templateStringLine(
    document: TextDocument,
    selectionLine: number,
  ): number {
    const currentLineText: string = document.lineAt(selectionLine).text;
    let currentLineNum: number = selectionLine + 1;
    let nbrOfBackticks: number = (currentLineText.match(/`/g) || []).length;
    while (currentLineNum < document.lineCount) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      nbrOfBackticks += (currentLineText.match(/`/g) || []).length;
      if (nbrOfBackticks % 2 === 0) {
        break;
      }
      currentLineNum++;
    }
    return nbrOfBackticks % 2 === 0 ? currentLineNum + 1 : selectionLine + 1;
  }
  locOpenedClosedElementOccurrences(
    loc: string,
    bracketType: BracketType,
  ): { openedElementOccurrences: number; closedElementOccurrences: number } {
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
    const openedElement: RegExp =
      bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
    const closedElement: RegExp =
      bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
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
  closingElementLine(
    document: TextDocument,
    lineNum: number,
    bracketType: BracketType,
  ): number {
    const docNbrOfLines: number = document.lineCount;
    let closingElementFound = false;
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
    while (!closingElementFound && lineNum < docNbrOfLines - 1) {
      const currentLineText: string = document.lineAt(lineNum).text;
      const openedClosedElementOccurrences =
        this.locOpenedClosedElementOccurrences(currentLineText, bracketType);
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
}
