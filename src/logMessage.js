// @flow

const vscode = require("vscode");
const lineCodeProcessing = require("./lineCodeProcessing");
import type { JSBlockType, LogMessage } from "./Types";

/**
 * Return a log message on the following format: ClassThatEncloseTheSelectedVar -> FunctionThatEncloseTheSelectedVar -> TheSelectedVar, SelectedVarValue
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function message(
  document: vscode.TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  wrapLogMessage: boolean,
  logMessagePrefix: string,
  quote: string,
  addSemicolonInTheEnd: boolean,
  insertEnclosingClass: boolean,
  insertEnclosingFunction: boolean,
  tabSize: number
): string {
  const classThatEncloseTheVar: string = enclosingBlockName(
    document,
    lineOfSelectedVar,
    "class"
  );
  const funcThatEncloseTheVar: string = enclosingBlockName(
    document,
    lineOfSelectedVar,
    "function"
  );
  const lineOfLogMsg: number = logMessageLine(
    document,
    lineOfSelectedVar,
    selectedVar
  );
  const spacesBeforeMsg: string = spaces(document, lineOfSelectedVar, tabSize);
  const semicolon: string = addSemicolonInTheEnd ? ";" : "";
  const debuggingMsg: string = `console.log(${quote}${logMessagePrefix}${
    logMessagePrefix.length !== 0 ? ": " : ""
  }${insertEnclosingClass ? classThatEncloseTheVar : ""}${
    insertEnclosingFunction ? funcThatEncloseTheVar : ""
  }${selectedVar}${quote}, ${selectedVar})${semicolon}`;
  if (wrapLogMessage) {
    // 16 represents the length of console.log("");
    const wrappingMsg: string = `console.log(${quote}${logMessagePrefix}: ${"-".repeat(
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

/**
 * Line of the log message to insert
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function logMessageLine(
  document: vscode.TextDocument,
  selectionLine: number,
  selectedVar: string
): number {
  if (selectionLine === document.lineCount - 1) {
    return selectionLine;
  }
  let currentLineText: string = document.lineAt(selectionLine).text;
  let nextLineText: string = document
    .lineAt(selectionLine + 1)
    .text.replace(/\s/g, "");
  if (lineCodeProcessing.checkObjectDeclaration(currentLineText)) {
    // Selected variable is an object
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
      if (nbrOfOpenedBrackets === nbrOfClosedBrackets) break;
    }
    return nbrOfClosedBrackets === nbrOfOpenedBrackets
      ? currentLineNum
      : selectionLine + 1;
  } else if (
    lineCodeProcessing.checkObjectFunctionCallDeclaration(
      currentLineText,
      nextLineText
    )
  ) {
    // Selected variable get it's value from an object function call
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
        if (currentLineNum === document.lineCount - 1) break;
        nextLineText = document.lineAt(currentLineNum + 1).text;
        currentLineNum++;
        if (
          nbrOfOpenedParenthesis === nbrOfClosedParenthesis &&
          !currentLineText.endsWith(".") &&
          !nextLineText.trim().startsWith(".")
        )
          break;
      }
    }
    return nbrOfOpenedParenthesis === nbrOfClosedParenthesis
      ? currentLineNum
      : selectionLine + 1;
  } else if (lineCodeProcessing.checkFunctionCallDeclaration(currentLineText)) {
    // Selected variable get it's value from a direct function call
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
        if (nbrOfOpenedParenthesis === nbrOfClosedParenthesis) break;
      }
    }
    return nbrOfOpenedParenthesis === nbrOfClosedParenthesis
      ? currentLineNum
      : selectionLine + 1;
  } else if (/`/.test(currentLineText)) {
    // Template string
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
  } else if (
    lineCodeProcessing.checkArrayDeclaration(currentLineText, nextLineText)
  ) {
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
        if (nbrOfOpenedBrackets === nbrOfClosedBrackets) break;
      }
    }
    return nbrOfOpenedBrackets === nbrOfClosedBrackets
      ? currentLineNum
      : selectionLine + 1;
  } else {
    if (currentLineText.trim().startsWith("return")) return selectionLine;
    return selectionLine + 1;
  }
}

/**
 * Spaces to insert before the log message
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function spaces(
  document: vscode.TextDocument,
  line: number,
  tabSize: number
): string {
  const currentLine: vscode.TextLine = document.lineAt(line);
  const currentLineTextChars: string[] = currentLine.text.split("");
  if (
    lineCodeProcessing.checkIfFunction(currentLine.text) ||
    lineCodeProcessing.checkIfJSBuiltInStatement(currentLine.text) ||
    lineCodeProcessing.checkClassDeclaration(currentLine.text)
  ) {
    const nextLine: vscode.TextLine = document.lineAt(line + 1);
    const nextLineTextChars: string[] = nextLine.text.split("");
    if (nextLineTextChars.filter(char => char !== " ").length !== 0) {
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
      currentLineTextChars[currentLine.firstNonWhitespaceCharacterIndex - 1] ===
      "\t"
    ) {
      return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex * tabSize);
    } else {
      return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
    }
  }
}
/**
 * Return the name of the enclosing block whether if it's a class or a function
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function enclosingBlockName(
  document: vscode.TextDocument,
  lineOfSelectedVar: number,
  blockType: JSBlockType
): string {
  let currentLineNum: number = lineOfSelectedVar;
  while (currentLineNum >= 0) {
    const currentLineText: string = document.lineAt(currentLineNum).text;
    switch (blockType) {
      case "class":
        if (lineCodeProcessing.checkClassDeclaration(currentLineText)) {
          if (
            lineOfSelectedVar > currentLineNum &&
            lineOfSelectedVar <
              blockClosingBraceLineNum(document, currentLineNum)
          ) {
            return `${lineCodeProcessing.className(currentLineText)} -> `;
          }
        }
        break;
      case "function":
        if (
          lineCodeProcessing.checkIfFunction(currentLineText) &&
          !lineCodeProcessing.checkIfJSBuiltInStatement(currentLineText)
        ) {
          if (
            lineOfSelectedVar >= currentLineNum &&
            lineOfSelectedVar <
              blockClosingBraceLineNum(document, currentLineNum)
          ) {
            if (lineCodeProcessing.functionName(currentLineText).length !== 0) {
              return `${lineCodeProcessing.functionName(currentLineText)} -> `;
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

/**
 * Return the number line of the block's closing brace
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function blockClosingBraceLineNum(
  document: vscode.TextDocument,
  lineNum: number
): number {
  const docNbrOfLines: number = document.lineCount;
  let enclosingBracketFounded: boolean = false;
  let nbrOfOpeningBrackets: number = 1;
  let nbrOfClosingBrackets: number = 0;
  while (!enclosingBracketFounded && lineNum < docNbrOfLines - 1) {
    lineNum++;
    const currentLineText: string = document.lineAt(lineNum).text;
    if (/{/.test(currentLineText)) {
      nbrOfOpeningBrackets++;
    }
    if (/}/.test(currentLineText)) {
      nbrOfClosingBrackets++;
    }
    if (nbrOfOpeningBrackets === nbrOfClosingBrackets) {
      enclosingBracketFounded = true;
      return lineNum;
    }
  }
  return lineNum;
}

/**
 * Detect all log messages inserted by this extension and then return their ranges
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function detectAll(
  document: vscode.TextDocument,
  tabSize: number,
  logMessagePrefix: string
): LogMessage[] {
  const documentNbrOfLines: number = document.lineCount;
  const logMessages: LogMessage[] = [];
  for (let i = 0; i < documentNbrOfLines; i++) {
    const turboConsoleLogMessage: RegExp = /console\.log\(('|"|`).*/;
    if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
      const logMessage: LogMessage = {
        lines: []
      };
      let nbrOfOpenParenthesis: number = 0;
      let nbrOfCloseParenthesis: number = 0;
      logMessage.spaces = spaces(document, i, tabSize);
      for (let j = i; j <= documentNbrOfLines; j++) {
        logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
        const currentLineText: string = document.lineAt(j).text;
        const openedParenthesisRegex: RegExp = /\(/g;
        const closedParenthesisRegex: RegExp = /\)/g;
        const openedParenthesis: any = openedParenthesisRegex.exec(
          currentLineText
        );
        const closedParenthesis: any = closedParenthesisRegex.exec(
          currentLineText
        );
        if (openedParenthesis) {
          nbrOfOpenParenthesis += openedParenthesis.length;
        }
        if (closedParenthesis) {
          nbrOfCloseParenthesis += closedParenthesis.length;
        }
        if (nbrOfOpenParenthesis === nbrOfCloseParenthesis) break;
      }
      logMessages.push(logMessage);
    }
  }
  return logMessages;
}

module.exports.message = message;
module.exports.logMessageLine = logMessageLine;
module.exports.spaces = spaces;
module.exports.detectAll = detectAll;
