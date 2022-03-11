import * as vscode from "vscode";
import { TextDocument, TextEditorEdit, TextLine } from "vscode";
import { DebugMessage } from "..";
import { BlockType, LocElement, Message } from "../../entities";
import { LineCodeProcessing } from "../../line-code-processing";

export class CSUnityDebugMessage extends DebugMessage {
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
    delemiterInsideMessage: string,
    includeFileNameAndLineNum: boolean,
    tabSize: number
  ): void {
    const classThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      "class"
    );
    const funcThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      "function"
    );
    const lineOfLogMsg: number = this.line(
      document,
      lineOfSelectedVar,
      selectedVar
    );
    const spacesBeforeMsg: string = this.spacesBefore(
      document,
      lineOfSelectedVar,
      tabSize
    );
    const semicolon: string = addSemicolonInTheEnd ? ";" : "";
    const fileName = document.fileName.includes("/")
      ? document.fileName.split("/")[document.fileName.split("/").length - 1]
      : document.fileName.split("\\")[document.fileName.split("\\").length - 1];
    if (
      !includeFileNameAndLineNum &&
      !insertEnclosingFunction &&
      !insertEnclosingClass &&
      logMessagePrefix.length === 0
    ) {
      logMessagePrefix = `${delemiterInsideMessage} `;
    }

    const debuggingMsg: string = `Debug.Log(${quote}${logMessagePrefix}${logMessagePrefix.length !== 0 &&
      logMessagePrefix !== `${delemiterInsideMessage} `
      ? ` ${delemiterInsideMessage} `
      : ""}${includeFileNameAndLineNum
      ? `file: ${fileName} ${delemiterInsideMessage} line ${lineOfLogMsg + 1} ${delemiterInsideMessage} `
      : ""}${insertEnclosingClass
      ? classThatEncloseTheVar.length > 0
        ? `${classThatEncloseTheVar} ${delemiterInsideMessage} `
        : ``
      : ""}${insertEnclosingFunction
      ? funcThatEncloseTheVar.length > 0
        ? `${funcThatEncloseTheVar} ${delemiterInsideMessage} `
        : ""
      : ""} ${quote} + ${selectedVar});`;
    
    if (wrapLogMessage) {
      // 21 represents the length of console.log("");
      const wrappingMsg: string = `Debug.Log(${quote}${logMessagePrefix} ${"-".repeat(
        debuggingMsg.length - 21
      )}${quote})${semicolon}`;
      textEditor.insert(
        new vscode.Position(
          lineOfLogMsg >= document.lineCount
            ? document.lineCount
            : lineOfLogMsg,
          0
        ),
        `${
          lineOfLogMsg === document.lineCount ? "\n" : ""
        }${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}${wrappingMsg}\n`
      );
    }
    const previousMsgLogLine = document.lineAt(lineOfLogMsg - 1);
    if (/\){.*}/.test(previousMsgLogLine.text.replace(/\s/g, ""))) {
      const textBeforeClosedFunctionParenthesis =
        previousMsgLogLine.text.split(")")[0];
      textEditor.delete(previousMsgLogLine.rangeIncludingLineBreak);
      textEditor.insert(
        new vscode.Position(
          lineOfLogMsg >= document.lineCount
            ? document.lineCount
            : lineOfLogMsg,
          0
        ),
        `${textBeforeClosedFunctionParenthesis}){\n${
          lineOfLogMsg === document.lineCount ? "\n" : ""
        }${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}}\n`
      );
    } else {
      textEditor.insert(
        new vscode.Position(
          lineOfLogMsg >= document.lineCount
            ? document.lineCount
            : lineOfLogMsg,
          0
        ),
        `${
          lineOfLogMsg === document.lineCount ? "\n" : ""
        }${spacesBeforeMsg}${debuggingMsg}\n`
      );
    }
  }
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string
  ): number {
    if (selectionLine === document.lineCount - 1) {
      return selectionLine;
    }
    const multilineParenthesisVariableLine = this.getMultiLineVariableLine(
      document,
      selectionLine,
      LocElement.Parenthesis
    );
    const multilineBracesVariableLine = this.getMultiLineVariableLine(
      document,
      selectionLine,
      LocElement.Braces
    );
    let currentLineText: string = document.lineAt(selectionLine).text;
    let nextLineText: string = document
      .lineAt(selectionLine + 1)
      .text.replace(/\s/g, "");
    if (
      this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
        `${currentLineText}\n${nextLineText}`
      )
    ) {
      return this.objectLiteralLine(document, selectionLine);
    } else if (
      this.lineCodeProcessing.isFunctionAssignedToVariable(`${currentLineText}`)
    ) {
      if (currentLineText.split("=")[0].includes(selectedVar)) {
        return this.functionAssignmentLine(document, selectionLine);
      } else {
        return this.functionOpenedBraceLine(document, selectionLine) + 1;
      }
    } else if (
      this.lineCodeProcessing.isObjectFunctionCall(
        `${currentLineText}\n${nextLineText}`
      )
    ) {
      return this.objectFunctionCallLine(document, selectionLine, selectedVar);
    } else if (
      this.lineCodeProcessing.isArrayAssignedToVariable(
        `${currentLineText}\n${currentLineText}`
      )
    ) {
      return this.arrayLine(document, selectionLine);
    } else if (
      this.lineCodeProcessing.isValueAssignedToVariable(
        `${currentLineText}\n${currentLineText}`
      )
    ) {
      return multilineParenthesisVariableLine !== null &&
        this.lineText(document, multilineParenthesisVariableLine - 1).includes(
          "{"
        )
        ? multilineParenthesisVariableLine
        : selectionLine + 1;
    } else if (this.lineCodeProcessing.isFunctionDeclaration(currentLineText)) {
      if (
        multilineParenthesisVariableLine !== null &&
        this.lineText(document, multilineParenthesisVariableLine - 1).includes(
          "{"
        )
      ) {
        return multilineParenthesisVariableLine;
      } else {
        const lineOfOpenedBrace = this.functionOpenedBraceLine(
          document,
          selectionLine
        );
        if (lineOfOpenedBrace !== -1) {
          return lineOfOpenedBrace + 1;
        }
      }
    } else if (/`/.test(currentLineText)) {
      return this.templateStringLine(document, selectionLine);
    } else if (
      multilineParenthesisVariableLine !== null &&
      this.lineText(document, multilineParenthesisVariableLine - 1).includes(
        "{"
      )
    ) {
      return multilineParenthesisVariableLine;
    } else if (multilineBracesVariableLine !== null) {
      return multilineBracesVariableLine;
    } else if (currentLineText.trim().startsWith("return")) {
      return selectionLine;
    }
    return selectionLine + 1;
  }
  private objectLiteralLine(
    document: TextDocument,
    selectionLine: number
  ): number {
    let currentLineText: string = document.lineAt(selectionLine).text;
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
    selectedVar: string
  ): number {
    let currentLineText: string = document.lineAt(selectionLine).text;
    let nextLineText: string = document
      .lineAt(selectionLine + 1)
      .text.replace(/\s/g, "");
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
        LocElement.Parenthesis
      );
    totalOpenedParenthesis += openedElementOccurrences;
    totalClosedParenthesis += closedElementOccurrences;
    let currentLineNum = selectionLine + 1;
    if (
      totalOpenedParenthesis !== totalClosedParenthesis ||
      currentLineText.endsWith(".") ||
      nextLineText.trim().startsWith(".")
    ) {
      while (currentLineNum < document.lineCount) {
        currentLineText = document.lineAt(currentLineNum).text;
        const { openedElementOccurrences, closedElementOccurrences } =
          this.locOpenedClosedElementOccurrences(
            currentLineText,
            LocElement.Parenthesis
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
          !currentLineText.endsWith(".") &&
          !nextLineText.trim().startsWith(".")
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
    selectionLine: number
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
        LocElement.Parenthesis
      );
      return (
        this.closingElementLine(
          document,
          closedParenthesisLine,
          LocElement.Braces
        ) + 1
      );
    }
  }
  private templateStringLine(
    document: TextDocument,
    selectionLine: number
  ): number {
    let currentLineText: string = document.lineAt(selectionLine).text;
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
    let currentLineText: string = document.lineAt(selectionLine).text;
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
    blockType: LocElement
  ): number | null {
    let currentLineNum = lineNum - 1;
    let nbrOfOpenedBlockType: number = 0;
    let nbrOfClosedBlockType: number = 1; // Closing parenthesis
    while (currentLineNum >= 0) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      const currentLineParenthesis = this.locOpenedClosedElementOccurrences(
        currentLineText,
        blockType
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
  private functionOpenedBraceLine(docuemt: TextDocument, line: number) {
    let nbrOfOpenedBraces = 0;
    let nbrOfClosedBraces = 0;
    while (line < docuemt.lineCount) {
      const { openedElementOccurrences, closedElementOccurrences } =
        this.locOpenedClosedElementOccurrences(
          this.lineText(docuemt, line),
          LocElement.Braces
        );
      nbrOfOpenedBraces += openedElementOccurrences;
      nbrOfClosedBraces += closedElementOccurrences;
      if (
        nbrOfOpenedBraces - nbrOfClosedBraces === 1 ||
        nbrOfOpenedBraces - nbrOfClosedBraces === 0
      ) {
        return line;
      }
      line++;
    }
    return -1;
  }
  spacesBefore(document: TextDocument, line: number, tabSize: number): string {
    const currentLine: TextLine = document.lineAt(line);
    const currentLineTextChars: string[] = currentLine.text.split("");
    if (
      (!this.lineCodeProcessing.isFunctionAssignedToVariable(
        currentLine.text
      ) &&
        this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
          currentLine.text
        )) ||
      this.lineCodeProcessing.doesContainsBuiltInFunction(currentLine.text) ||
      this.lineCodeProcessing.doesContainClassDeclaration(currentLine.text)
    ) {
      const nextLine: TextLine = document.lineAt(line + 1);
      const nextLineTextChars: string[] = nextLine.text.split("");
      if (nextLineTextChars.filter((char) => char !== " ").length !== 0) {
        if (
          nextLine.firstNonWhitespaceCharacterIndex >
          currentLine.firstNonWhitespaceCharacterIndex
        ) {
          if (
            nextLineTextChars[nextLine.firstNonWhitespaceCharacterIndex - 1] ===
            "\t"
          ) {
            return " ".repeat(
              nextLine.firstNonWhitespaceCharacterIndex * tabSize
            );
          } else {
            return " ".repeat(nextLine.firstNonWhitespaceCharacterIndex);
          }
        } else {
          if (
            currentLineTextChars[
              currentLine.firstNonWhitespaceCharacterIndex - 1
            ] === "\t"
          ) {
            return " ".repeat(
              currentLine.firstNonWhitespaceCharacterIndex * tabSize
            );
          } else {
            return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
          }
        }
      } else {
        if (
          currentLineTextChars[
            currentLine.firstNonWhitespaceCharacterIndex - 1
          ] === "\t"
        ) {
          return " ".repeat(
            currentLine.firstNonWhitespaceCharacterIndex * tabSize
          );
        } else {
          return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
        }
      }
    } else {
      if (
        currentLineTextChars[
          currentLine.firstNonWhitespaceCharacterIndex - 1
        ] === "\t"
      ) {
        return " ".repeat(
          currentLine.firstNonWhitespaceCharacterIndex * tabSize
        );
      } else {
        return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
      }
    }
  }
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType
  ): string {
    let currentLineNum: number = lineOfSelectedVar;
    while (currentLineNum >= 0) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      switch (blockType) {
        case "class":
          if (
            this.lineCodeProcessing.doesContainClassDeclaration(currentLineText)
          ) {
            if (
              lineOfSelectedVar > currentLineNum &&
              lineOfSelectedVar <
                this.closingElementLine(
                  document,
                  currentLineNum,
                  LocElement.Braces
                )
            ) {
              return `${this.lineCodeProcessing.getClassName(currentLineText)}`;
            }
          }
          break;
        case "function":
          if (
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
              currentLineText
            ) &&
            !this.lineCodeProcessing.doesContainsBuiltInFunction(
              currentLineText
            )
          ) {
            if (
              lineOfSelectedVar >= currentLineNum &&
              lineOfSelectedVar <
                this.closingElementLine(
                  document,
                  currentLineNum,
                  LocElement.Braces
                )
            ) {
              if (
                this.lineCodeProcessing.getFunctionName(currentLineText)
                  .length !== 0
              ) {
                return `${this.lineCodeProcessing.getFunctionName(
                  currentLineText
                )}`;
              }
              return "";
            }
          }
          break;
      }
      currentLineNum--;
    }
    return "";
  }
  detectAll(
    document: TextDocument,
    tabSize: number,
    delemiterInsideMessage: string,
    quote: string,
  ): Message[] {
    const documentNbrOfLines: number = document.lineCount;
    const logMessages: Message[] = [];
    for (let i = 0; i < documentNbrOfLines; i++) {
      const turboConsoleLogMessage: RegExp = /Debug\.Log\(/;
      if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
        const logMessage: Message = {
          spaces: "",
          lines: [],
        };
        logMessage.spaces = this.spacesBefore(document, i, tabSize);
        const closedParenthesisLine = this.closingElementLine(
          document,
          i,
          LocElement.Parenthesis
        );
        let msg = "";
        for (let j = i; j <= closedParenthesisLine; j++) {
          msg += document.lineAt(j).text;
          logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
        }
        if (
          new RegExp(
            `${delemiterInsideMessage}{1}[a-zA-Z0-9]+[0-9{}]*${quote}(,|\\+)[a-zA-Z0-9.]+\\){1}`
          ).test(msg.replace(/\s/g, ""))
        ) {
          logMessages.push(logMessage);
        }
      }
    }
    return logMessages;
  }
}


