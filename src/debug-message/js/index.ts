import { TextDocument, TextLine } from "vscode";
import { DebugMessage } from "..";
import { BlockType, LocElement, Message } from "../../entities";
import { LineCodeProcessing } from "../../line-code-processing";

export class JSDebugMessage extends DebugMessage {
  constructor(lineCodeProcessing: LineCodeProcessing) {
    super(lineCodeProcessing);
  }
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
    delemiterInsideMessage: string,
    tabSize: number
  ): string {
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
    const debuggingMsg: string = `console.log(${quote}${logMessagePrefix}${
      logMessagePrefix.length !== 0 ? ` ${delemiterInsideMessage} ` : ""
    }${`file: ${fileName} ${delemiterInsideMessage} line ${
      lineOfLogMsg + 1
    } ${delemiterInsideMessage} `}${
      insertEnclosingClass
        ? classThatEncloseTheVar.length > 0
          ? `${classThatEncloseTheVar} ${delemiterInsideMessage} `
          : ``
        : ""
    }${
      insertEnclosingFunction
        ? funcThatEncloseTheVar.length > 0
          ? `${funcThatEncloseTheVar} ${delemiterInsideMessage} `
          : ""
        : ""
    }${selectedVar}${quote}, ${selectedVar})${semicolon}`;
    if (wrapLogMessage) {
      // 16 represents the length of console.log("");
      const wrappingMsg: string = `console.log(${quote}${logMessagePrefix} ${"-".repeat(
        debuggingMsg.length - 16
      )}${quote})${semicolon}`;
      return `${
        lineOfLogMsg === document.lineCount ? "\n" : ""
      }${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}${wrappingMsg}\n`;
    }
    return `${
      lineOfLogMsg === document.lineCount ? "\n" : ""
    }${spacesBeforeMsg}${debuggingMsg}\n`;
  }
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string
  ): number {
    if (selectionLine === document.lineCount - 1) {
      return selectionLine;
    }
    const lineOfFunctionParam = this.functionParamLine(
      document,
      selectionLine,
      selectedVar
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
      this.lineCodeProcessing.doesContainsObjectFunctionCall(
        `${currentLineText}\n${nextLineText}`
      )
    ) {
      return this.objectFunctionCallLine(document, selectionLine, selectedVar);
    } else if (
      this.lineCodeProcessing.doesContainsFunctionCall(currentLineText)
    ) {
      return this.functionCallLine(document, selectionLine, selectedVar);
    } else if (/`/.test(currentLineText)) {
      return this.templateStringLine(document, selectionLine);
    } else if (
      this.lineCodeProcessing.isArrayAssignedToVariable(
        `${currentLineText}\n${currentLineText}`
      )
    ) {
      return this.arrayLine(document, selectionLine);
    } else if (lineOfFunctionParam !== -1) {
      return lineOfFunctionParam;
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
    const openedParenthesisRegex: RegExp = /\(/g;
    const closedParenthesisRegex: RegExp = /\)/g;
    let nbrOfOpenedParenthesis: number = 0;
    let nbrOfClosedParenthesis: number = 0;
    let openedParenthesis: any = openedParenthesisRegex.exec(currentLineText);
    if (openedParenthesis) {
      nbrOfOpenedParenthesis += openedParenthesis.length;
    }
    let closedParenthesis: any = closedParenthesisRegex.exec(currentLineText);
    if (closedParenthesis) {
      nbrOfClosedParenthesis += 1;
    }
    let currentLineNum = selectionLine + 1;
    if (
      nbrOfOpenedParenthesis !== nbrOfClosedParenthesis ||
      currentLineText.endsWith(".") ||
      nextLineText.trim().startsWith(".")
    ) {
      while (currentLineNum < document.lineCount) {
        currentLineText = document.lineAt(currentLineNum).text;
        openedParenthesis = openedParenthesisRegex.exec(currentLineText);
        if (openedParenthesis) {
          nbrOfOpenedParenthesis += openedParenthesis.length;
        }
        closedParenthesis = closedParenthesisRegex.exec(currentLineText);
        if (closedParenthesis) {
          nbrOfClosedParenthesis += closedParenthesis.length;
        }
        if (currentLineNum === document.lineCount - 1) {
          break;
        }
        nextLineText = document.lineAt(currentLineNum + 1).text;
        currentLineNum++;
        if (
          nbrOfOpenedParenthesis === nbrOfClosedParenthesis &&
          !currentLineText.endsWith(".") &&
          !nextLineText.trim().startsWith(".")
        ) {
          break;
        }
      }
    }
    return nbrOfOpenedParenthesis === nbrOfClosedParenthesis
      ? currentLineNum
      : selectionLine + 1;
  }
  private functionCallLine(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string
  ): number {
    let currentLineText: string = document.lineAt(selectionLine).text;
    if (
      /\((\s*)$/.test(currentLineText.split(selectedVar)[0]) ||
      /,(\s*)$/.test(currentLineText.split(selectedVar)[0])
    ) {
      return selectionLine + 1;
    }
    let nbrOfOpenedParenthesis: number = (currentLineText.match(/\(/g) || [])
      .length;
    let nbrOfClosedParenthesis: number = (currentLineText.match(/\)/g) || [])
      .length;
    let currentLineNum: number = selectionLine + 1;
    if (nbrOfOpenedParenthesis !== nbrOfClosedParenthesis) {
      while (currentLineNum < document.lineCount) {
        const currentLineText: string = document.lineAt(currentLineNum).text;
        nbrOfOpenedParenthesis += (currentLineText.match(/\(/g) || []).length;
        nbrOfClosedParenthesis += (currentLineText.match(/\)/g) || []).length;
        currentLineNum++;
        if (nbrOfOpenedParenthesis === nbrOfClosedParenthesis) {
          break;
        }
      }
    }
    return nbrOfOpenedParenthesis === nbrOfClosedParenthesis
      ? currentLineNum
      : selectionLine + 1;
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
  private functionParamLine(
    document: TextDocument,
    lineNum: number,
    selectedVar: string
  ) {
    let currentLineNum = lineNum;
    const {
      openedElementOccurrences,
      closedElementOccurrences,
    } = this.locOpenedClosedElementOccurrences(
      document.lineAt(currentLineNum).text,
      LocElement.Parenthesis
    );
    if (
      !document
        .lineAt(currentLineNum)
        .text.split(selectedVar)[1]
        .includes("(") &&
      openedElementOccurrences &&
      closedElementOccurrences &&
      openedElementOccurrences === closedElementOccurrences
    ) {
      return currentLineNum + 1;
    }
    let nbrOfOpenedParenthesis: number = 0;
    let nbrOfClosedParenthesis: number = 1; // Closing parenthesis of the function
    while (currentLineNum >= 0) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      const currentLineParenthesis = this.locOpenedClosedElementOccurrences(
        currentLineText,
        LocElement.Parenthesis
      );
      if (
        currentLineNum === lineNum &&
        document.lineAt(currentLineNum).text.split(selectedVar)[1].includes("(")
      ) {
        currentLineParenthesis.openedElementOccurrences = 0;
        currentLineParenthesis.closedElementOccurrences = 0;
      }
      nbrOfOpenedParenthesis += currentLineParenthesis.openedElementOccurrences;
      nbrOfClosedParenthesis += currentLineParenthesis.closedElementOccurrences;
      if (nbrOfOpenedParenthesis === nbrOfClosedParenthesis) {
        return (
          this.closingElementLine(
            document,
            currentLineNum,
            LocElement.Parenthesis
          ) + 1
        );
      }
      currentLineNum--;
    }
    return -1;
  }
  spacesBefore(document: TextDocument, line: number, tabSize: number): string {
    const currentLine: TextLine = document.lineAt(line);
    const currentLineTextChars: string[] = currentLine.text.split("");
    if (
      this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
        currentLine.text
      ) ||
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
    logMessagePrefix: string
  ): Message[] {
    const documentNbrOfLines: number = document.lineCount;
    const logMessages: Message[] = [];
    for (let i = 0; i < documentNbrOfLines; i++) {
      const turboConsoleLogMessage: RegExp = /console\.log\(/;
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
        if (/file:.*line[0-9]{1,}/.test(msg.replace(/\s/g, ""))) {
          logMessages.push(logMessage);
        }
      }
    }
    return logMessages;
  }
}
