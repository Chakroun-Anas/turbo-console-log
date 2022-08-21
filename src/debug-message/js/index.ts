import * as vscode from 'vscode';
import { TextDocument, TextEditorEdit, TextLine } from 'vscode';
import { DebugMessage } from '..';
import { BlockType, LocElement, Message } from '../../entities';
import { LineCodeProcessing } from '../../line-code-processing';

export class JSDebugMessage extends DebugMessage {
  constructor(lineCodeProcessing: LineCodeProcessing) {
    super(lineCodeProcessing);
  }
  msg(
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
  ): void {
    const classThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      'class',
    );
    const funcThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      'function',
    );
    const lineOfLogMsg: number = this.line(
      document,
      lineOfSelectedVar,
      selectedVar,
    );
    const linesToAdd: number = insertEmptyLineBeforeLogMessage ? 2 : 1;
    const spacesBeforeMsg: string = this.spacesBeforeLogMsg(
      document,
      lineOfSelectedVar,
      lineOfLogMsg,
    );
    const semicolon: string = addSemicolonInTheEnd ? ';' : '';
    const fileName = document.fileName.includes('/')
      ? document.fileName.split('/')[document.fileName.split('/').length - 1]
      : document.fileName.split('\\')[document.fileName.split('\\').length - 1];
    if (
      !includeFileNameAndLineNum &&
      !insertEnclosingFunction &&
      !insertEnclosingClass &&
      logMessagePrefix.length === 0
    ) {
      logMessagePrefix = `${delemiterInsideMessage} `;
    }
    const debuggingMsg = `${
      logFunction !== 'log' ? logFunction : `console.${logType}`
    }(${quote}${logMessagePrefix}${
      logMessagePrefix.length !== 0 &&
      logMessagePrefix !== `${delemiterInsideMessage} `
        ? ` ${delemiterInsideMessage} `
        : ''
    }${
      includeFileNameAndLineNum
        ? `file: ${fileName} ${delemiterInsideMessage} line ${
            lineOfLogMsg + linesToAdd
          } ${delemiterInsideMessage} `
        : ''
    }${
      insertEnclosingClass
        ? classThatEncloseTheVar.length > 0
          ? `${classThatEncloseTheVar} ${delemiterInsideMessage} `
          : ``
        : ''
    }${
      insertEnclosingFunction
        ? funcThatEncloseTheVar.length > 0
          ? `${funcThatEncloseTheVar} ${delemiterInsideMessage} `
          : ''
        : ''
    }${selectedVar}${quote}, ${selectedVar})${semicolon}`;
    if (wrapLogMessage) {
      // 16 represents the length of console.log("");
      const wrappingMsg = `console.${logType}(${quote}${logMessagePrefix} ${'-'.repeat(
        debuggingMsg.length - 16,
      )}${logMessagePrefix}${quote})${semicolon}`;
      textEditor.insert(
        new vscode.Position(
          lineOfLogMsg >= document.lineCount
            ? document.lineCount
            : lineOfLogMsg,
          0,
        ),
        `${
          lineOfLogMsg === document.lineCount ? '\n' : ''
        }${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}${wrappingMsg}\n`,
      );
      return;
    }
    const previousMsgLogLine = document.lineAt(lineOfLogMsg - 1);
    if (/\){.*}/.test(previousMsgLogLine.text.replace(/\s/g, ''))) {
      this.emptyBlockMsg(
        document,
        textEditor,
        previousMsgLogLine,
        lineOfLogMsg,
        debuggingMsg,
        spacesBeforeMsg,
      );
      return;
    }
    const selectedVarLine = document.lineAt(lineOfSelectedVar);
    const selectedVarLineLoc = selectedVarLine.text;
    if (
      this.lineCodeProcessing.isAnonymousFunction(selectedVarLineLoc) &&
      this.lineCodeProcessing.isArgumentOfAnonymousFunction(
        selectedVarLineLoc,
        selectedVar,
      ) &&
      this.lineCodeProcessing.shouldTransformAnonymousFunction(
        selectedVarLineLoc,
      )
    ) {
      this.anonymousPropMsg(
        document,
        textEditor,
        tabSize,
        addSemicolonInTheEnd,
        selectedVarLine,
        debuggingMsg,
      );
      return;
    }
    textEditor.insert(
      new vscode.Position(
        lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg,
        0,
      ),
      `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
        lineOfLogMsg === document.lineCount ? '\n' : ''
      }${spacesBeforeMsg}${debuggingMsg}\n${
        insertEmptyLineAfterLogMessage ? '\n' : ''
      }`,
    );
  }
  private anonymousPropMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    tabSize: number,
    addSemicolonInTheEnd: boolean,
    selectedPropLine: TextLine,
    debuggingMsg: string,
  ) {
    const selectedVarPropLoc = selectedPropLine.text;
    const anonymousFunctionLeftPart = selectedVarPropLoc.split('=>')[0].trim();
    const anonymousFunctionRightPart = selectedVarPropLoc
      .split('=>')[1]
      .replace(';', '')
      .trim()
      .replace(/\)\s*;?$/, '');
    const spacesBeforeSelectedVarLine = this.spacesBeforeLine(
      document,
      selectedPropLine.lineNumber,
    );
    const spacesBeforeLinesToInsert = `${spacesBeforeSelectedVarLine}${' '.repeat(
      tabSize,
    )}`;
    const isCalledInsideFunction = /\)\s*;?$/.test(selectedVarPropLoc);
    const isNextLineCallToOtherFunction = document
      .lineAt(selectedPropLine.lineNumber + 1)
      .text.trim()
      .startsWith('.');
    const anonymousFunctionClosedParenthesisLine = this.functionClosedLine(
      document,
      selectedPropLine.lineNumber,
      LocElement.Parenthesis,
    );
    const isReturnBlockMultiLine =
      anonymousFunctionClosedParenthesisLine - selectedPropLine.lineNumber !==
      0;
    textEditor.delete(selectedPropLine.rangeIncludingLineBreak);
    textEditor.insert(
      new vscode.Position(selectedPropLine.lineNumber, 0),
      `${spacesBeforeSelectedVarLine}${anonymousFunctionLeftPart} => {\n`,
    );
    if (isReturnBlockMultiLine) {
      textEditor.insert(
        new vscode.Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMsg}\n`,
      );
      let currentLine = document.lineAt(selectedPropLine.lineNumber + 1);
      do {
        textEditor.delete(currentLine.rangeIncludingLineBreak);
        const addReturnKeyword =
          currentLine.lineNumber === selectedPropLine.lineNumber + 1;
        const spacesBeforeCurrentLine = this.spacesBeforeLine(
          document,
          currentLine.lineNumber,
        );
        if (currentLine.text.trim() === ')') {
          currentLine = document.lineAt(currentLine.lineNumber + 1);
          continue;
        }
        if (currentLine.lineNumber === anonymousFunctionClosedParenthesisLine) {
          textEditor.insert(
            new vscode.Position(currentLine.lineNumber, 0),
            `${spacesBeforeCurrentLine}${
              addReturnKeyword ? 'return ' : '\t'
            }${currentLine.text.trim().replace(/\)\s*$/, '')}\n`,
          );
        } else {
          textEditor.insert(
            new vscode.Position(currentLine.lineNumber, 0),
            `${spacesBeforeCurrentLine}${
              addReturnKeyword ? 'return ' : '\t'
            }${currentLine.text.trim()}\n`,
          );
        }
        currentLine = document.lineAt(currentLine.lineNumber + 1);
      } while (
        currentLine.lineNumber <
        anonymousFunctionClosedParenthesisLine + 1
      );
      textEditor.insert(
        new vscode.Position(anonymousFunctionClosedParenthesisLine + 1, 0),
        `${spacesBeforeSelectedVarLine}}${
          addSemicolonInTheEnd && !isReturnBlockMultiLine ? ';' : ''
        })\n`,
      );
    } else {
      const nextLineText = document.lineAt(
        selectedPropLine.lineNumber + 1,
      ).text;
      const nextLineIsEndWithinTheMainFunction = /^\)/.test(
        nextLineText.trim(),
      );
      textEditor.insert(
        new vscode.Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMsg}\n`,
      );
      textEditor.insert(
        new vscode.Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}return ${anonymousFunctionRightPart}${
          addSemicolonInTheEnd ? ';' : ''
        }\n`,
      );
      textEditor.insert(
        new vscode.Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeSelectedVarLine}}${isCalledInsideFunction ? ')' : ''}${
          addSemicolonInTheEnd &&
          !isNextLineCallToOtherFunction &&
          !nextLineIsEndWithinTheMainFunction
            ? ';'
            : ''
        }${nextLineText === '' ? '' : '\n'}`,
      );
    }
  }
  private emptyBlockMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    emptyBlockLine: TextLine,
    logMsgLine: number,
    debuggingMsg: string,
    spacesBeforeMsg: string,
  ) {
    if (/\){.*}/.test(emptyBlockLine.text.replace(/\s/g, ''))) {
      const textBeforeClosedFunctionParenthesis =
        emptyBlockLine.text.split(')')[0];
      textEditor.delete(emptyBlockLine.rangeIncludingLineBreak);
      textEditor.insert(
        new vscode.Position(
          logMsgLine >= document.lineCount ? document.lineCount : logMsgLine,
          0,
        ),
        `${textBeforeClosedFunctionParenthesis}) {\n${
          logMsgLine === document.lineCount ? '\n' : ''
        }${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}}\n`,
      );
      return;
    }
  }
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): number {
    if (selectionLine === document.lineCount - 1) {
      return selectionLine;
    }
    const multilineParenthesisVariableLine = this.getMultiLineVariableLine(
      document,
      selectionLine,
      LocElement.Parenthesis,
    );
    const multilineBracesVariableLine = this.getMultiLineVariableLine(
      document,
      selectionLine,
      LocElement.Braces,
    );
    const currentLineText: string = document.lineAt(selectionLine).text;
    const nextLineText: string = document
      .lineAt(selectionLine + 1)
      .text.replace(/\s/g, '');
    if (
      this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
        `${currentLineText}\n${nextLineText}`,
      )
    ) {
      return this.objectLiteralLine(document, selectionLine);
    } else if (
      this.lineCodeProcessing.isFunctionAssignedToVariable(`${currentLineText}`)
    ) {
      if (currentLineText.split('=')[0].includes(selectedVar)) {
        return this.functionAssignmentLine(document, selectionLine);
      } else if (
        this.lineCodeProcessing.isAnonymousFunction(currentLineText) &&
        !this.lineCodeProcessing.shouldTransformAnonymousFunction(
          currentLineText,
        )
      ) {
        selectionLine + 1;
      } else {
        return (
          this.functionClosedLine(document, selectionLine, LocElement.Braces) +
          1
        );
      }
    } else if (
      this.lineCodeProcessing.isObjectFunctionCall(
        `${currentLineText}\n${nextLineText}`,
      )
    ) {
      return this.objectFunctionCallLine(document, selectionLine, selectedVar);
    } else if (
      this.lineCodeProcessing.isArrayAssignedToVariable(
        `${currentLineText}\n${currentLineText}`,
      )
    ) {
      return this.arrayLine(document, selectionLine);
    } else if (
      this.lineCodeProcessing.isValueAssignedToVariable(
        `${currentLineText}\n${currentLineText}`,
      )
    ) {
      return multilineParenthesisVariableLine !== null &&
        this.lineText(document, multilineParenthesisVariableLine - 1).includes(
          '{',
        )
        ? multilineParenthesisVariableLine
        : selectionLine + 1;
    } else if (this.lineCodeProcessing.isFunctionDeclaration(currentLineText)) {
      const { openedElementOccurrences, closedElementOccurrences } =
        this.locOpenedClosedElementOccurrences(
          document.lineAt(selectionLine).text,
          LocElement.Parenthesis,
        );
      if (openedElementOccurrences === closedElementOccurrences) {
        return selectionLine + 1;
      }
      return multilineParenthesisVariableLine || selectionLine + 1;
    } else if (/`/.test(currentLineText)) {
      return this.templateStringLine(document, selectionLine);
    } else if (
      multilineParenthesisVariableLine !== null &&
      this.lineText(document, multilineParenthesisVariableLine - 1).includes(
        '{',
      )
    ) {
      return multilineParenthesisVariableLine;
    } else if (multilineBracesVariableLine !== null) {
      return multilineBracesVariableLine;
    } else if (currentLineText.trim().startsWith('return')) {
      return selectionLine;
    }
    return selectionLine + 1;
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
        LocElement.Parenthesis,
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
            LocElement.Parenthesis,
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
  private functionAssignmentLine(
    document: TextDocument,
    selectionLine: number,
  ): number {
    const currentLineText = document.lineAt(selectionLine).text;
    if (/{/.test(currentLineText)) {
      return (
        this.closingElementLine(document, selectionLine, LocElement.Braces) + 1
      );
    } else {
      const closedParenthesisLine = this.closingElementLine(
        document,
        selectionLine,
        LocElement.Parenthesis,
      );
      return (
        this.closingElementLine(
          document,
          closedParenthesisLine,
          LocElement.Braces,
        ) + 1
      );
    }
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
  // Line for a variable which is in multiline context (function paramter, or deconstructred object)
  private getMultiLineVariableLine(
    document: TextDocument,
    lineNum: number,
    blockType: LocElement,
  ): number | null {
    let currentLineNum = lineNum - 1;
    let nbrOfOpenedBlockType = 0;
    let nbrOfClosedBlockType = 1; // Closing parenthesis
    while (currentLineNum >= 0) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      const currentLineParenthesis = this.locOpenedClosedElementOccurrences(
        currentLineText,
        blockType,
      );
      nbrOfOpenedBlockType += currentLineParenthesis.openedElementOccurrences;
      nbrOfClosedBlockType += currentLineParenthesis.closedElementOccurrences;
      if (nbrOfOpenedBlockType === nbrOfClosedBlockType) {
        return this.closingElementLine(document, currentLineNum, blockType) + 1;
      }
      currentLineNum--;
    }
    return null;
  }
  private functionClosedLine(
    docuemt: TextDocument,
    declarationLine: number,
    locElementType: LocElement,
  ): number {
    let nbrOfOpenedBraces = 0;
    let nbrOfClosedBraces = 0;
    while (declarationLine < docuemt.lineCount) {
      const { openedElementOccurrences, closedElementOccurrences } =
        this.locOpenedClosedElementOccurrences(
          this.lineText(docuemt, declarationLine),
          locElementType,
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
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string {
    let currentLineNum: number = lineOfSelectedVar;
    while (currentLineNum >= 0) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      switch (blockType) {
        case 'class':
          if (
            this.lineCodeProcessing.doesContainClassDeclaration(currentLineText)
          ) {
            if (
              lineOfSelectedVar > currentLineNum &&
              lineOfSelectedVar <
                this.closingElementLine(
                  document,
                  currentLineNum,
                  LocElement.Braces,
                )
            ) {
              return `${this.lineCodeProcessing.getClassName(currentLineText)}`;
            }
          }
          break;
        case 'function':
          if (
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
              currentLineText,
            ) &&
            !this.lineCodeProcessing.doesContainsBuiltInFunction(
              currentLineText,
            )
          ) {
            if (
              lineOfSelectedVar >= currentLineNum &&
              lineOfSelectedVar <
                this.closingElementLine(
                  document,
                  currentLineNum,
                  LocElement.Braces,
                )
            ) {
              if (
                this.lineCodeProcessing.getFunctionName(currentLineText)
                  .length !== 0
              ) {
                return `${this.lineCodeProcessing.getFunctionName(
                  currentLineText,
                )}`;
              }
              return '';
            }
          }
          break;
      }
      currentLineNum--;
    }
    return '';
  }
  detectAll(
    document: TextDocument,
    delemiterInsideMessage: string,
    quote: string,
  ): Message[] {
    const documentNbrOfLines: number = document.lineCount;
    const logMessages: Message[] = [];
    for (let i = 0; i < documentNbrOfLines; i++) {
      const turboConsoleLogMessage = /console\.log\(/;
      if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
        const logMessage: Message = {
          spaces: '',
          lines: [],
        };
        logMessage.spaces = this.spacesBeforeLogMsg(document, i, i);
        const closedParenthesisLine = this.closingElementLine(
          document,
          i,
          LocElement.Parenthesis,
        );
        let msg = '';
        for (let j = i; j <= closedParenthesisLine; j++) {
          msg += document.lineAt(j).text;
          logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
        }
        if (
          new RegExp(
            `${delemiterInsideMessage}[a-zA-Z0-9]+${quote},(//)?[a-zA-Z0-9]+`,
          ).test(msg.replace(/\s/g, ''))
        ) {
          logMessages.push(logMessage);
        }
      }
    }
    return logMessages;
  }
}
