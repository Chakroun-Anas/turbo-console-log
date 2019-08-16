const vscode = require("vscode");
const lineCodeProcessing = require("./line-code-processing");

/**
 * Return a log message on the following format: ClassThatEncloseTheSelectedVar -> FunctionThatEncloseTheSelectedVar -> TheSelectedVar, SelectedVarValue
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @param {string} selectedVar
 * @param {number} lineOfSelectedVar
 * @param {boolean} wrapLogMessage
 * @param {string} logMessagePrefix
 * @param {string} quote
 * @param {boolean} addSemicolonInTheEnd
 * @param {number} tabSize
 * @return {string}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function message(
  document,
  selectedVar,
  lineOfSelectedVar,
  wrapLogMessage,
  logMessagePrefix,
  quote,
  addSemicolonInTheEnd,
  insertEnclosingClass,
  insertEnclosingFunction,
  tabSize
) {
  const classThatEncloseTheVar = enclosingBlockName(
    document,
    lineOfSelectedVar,
    "class"
  );
  const funcThatEncloseTheVar = enclosingBlockName(
    document,
    lineOfSelectedVar,
    "function"
  );
  const lineOfLogMsg = logMessageLine(document, lineOfSelectedVar, selectedVar);
  const spacesBeforeMsg = spaces(document, lineOfSelectedVar, tabSize);
  const semicolon = addSemicolonInTheEnd ? ";" : "";
  const debuggingMsg = `console.log(${quote}${logMessagePrefix}: ${
    insertEnclosingClass ? classThatEncloseTheVar : ""
  }${
    insertEnclosingFunction ? funcThatEncloseTheVar : ""
  }${selectedVar}${quote}, ${selectedVar})${semicolon}`;
  if (wrapLogMessage) {
    // 16 represents the length of console.log("");
    const wrappingMsg = `console.log(${quote}${logMessagePrefix}: ${"-".repeat(
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

function logMessageLine(document, selectionLine, selectedVar) {
  if (selectionLine === document.lineCount - 1) {
    return selectionLine;
  }
  let currentLineText = document.lineAt(selectionLine).text;
  let nextLineText = document.lineAt(selectionLine + 1).text.replace(/\s/g, "");
  if (lineCodeProcessing.checkObjectDeclaration(currentLineText)) {
    // Selected varibale is an object
    let nbrOfOpenedBrackets = (currentLineText.match(/{/g) || []).length;
    let nbrOfClosedBrackets = (currentLineText.match(/}/g) || []).length;
    let currentLineNum = selectionLine + 1;
    while (currentLineNum < document.lineCount) {
      const currentLineText = document.lineAt(currentLineNum).text;
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
    const openedParenthesRegex = /\(/g;
    const closedParenthesRegex = /\)/g;
    let openedParenthesisMatch,
      openedParenthesisMatches = [];
    let closedParenthesisMatch,
      closedParenthesisNatches = [];
    while (
      (openedParenthesisMatch = openedParenthesRegex.exec(currentLineText)) !=
      null
    ) {
      openedParenthesisMatches.push(openedParenthesisMatch.index);
    }
    while (
      (closedParenthesisMatch = closedParenthesRegex.exec(currentLineText)) !=
      null
    ) {
      closedParenthesisNatches.push(closedParenthesisMatch.index);
    }
    let currentLineNum = selectionLine + 1;
    if (
      openedParenthesisMatches.length !== closedParenthesisNatches.length ||
      currentLineText.charAt(
        closedParenthesisNatches[closedParenthesisNatches.length - 1]
      ) === "." ||
      nextLineText.trim().startsWith(".")
    ) {
      while (currentLineNum < document.lineCount) {
        currentLineText = document.lineAt(currentLineNum).text;
        while (
          (openedParenthesisMatch = openedParenthesRegex.exec(
            currentLineText
          )) != null
        ) {
          openedParenthesisMatches.push(openedParenthesisMatch.index);
        }
        while (
          (closedParenthesisMatch = closedParenthesRegex.exec(
            currentLineText
          )) != null
        ) {
          closedParenthesisNatches.push(closedParenthesisMatch.index);
        }
        if (currentLineNum === document.lineCount - 1) break;
        nextLineText = document.lineAt(currentLineNum + 1).text;
        currentLineNum++;
        if (
          openedParenthesisMatches.length === closedParenthesisNatches.length &&
          !(
            currentLineText.charAt(
              closedParenthesisNatches[closedParenthesisNatches.length - 1]
            ) === "."
          ) &&
          !nextLineText.trim().startsWith(".")
        )
          break;
      }
    }
    return openedParenthesisMatches.length === closedParenthesisNatches.length
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
    let nbrOfOpenedParenthesis = (currentLineText.match(/\(/g) || []).length;
    let nbrOfClosedParenthesis = (currentLineText.match(/\)/g) || []).length;
    let currentLineNum = selectionLine + 1;
    if (nbrOfOpenedParenthesis !== nbrOfClosedParenthesis) {
      while (currentLineNum < document.lineCount) {
        const currentLineText = document.lineAt(currentLineNum).text;
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
    let currentLineNum = selectionLine + 1;
    let nbrOfBackticks = (currentLineText.match(/`/g) || []).length;
    while (currentLineNum < document.lineCount) {
      const currentLineText = document.lineAt(currentLineNum).text;
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
    let nbrOfOpenedBrackets = (currentLineText.match(/\[/g) || []).length;
    let nbrOfClosedBrackets = (currentLineText.match(/\]/g) || []).length;
    let currentLineNum = selectionLine + 1;
    if (nbrOfOpenedBrackets !== nbrOfClosedBrackets) {
      while (currentLineNum < document.lineCount) {
        const currentLineText = document.lineAt(currentLineNum).text;
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
 * Line Spaces
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @param {number} line
 * @param {number} tabSize
 * @return {string} Spaces
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function spaces(document, line, tabSize) {
  const currentLine = document.lineAt(line);
  const currentLineTextChars = currentLine.text.split("");
  if (
    lineCodeProcessing.checkIfFunction(currentLine.text) ||
    lineCodeProcessing.checkIfJSBuiltInStatement(currentLine.text) ||
    lineCodeProcessing.checkClassDeclaration(currentLine.text)
  ) {
    const nextLine = document.lineAt(line + 1);
    const nextLineTextChars = nextLine.text.split("");
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
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @param {number} lineOfSelectedVar
 * @param {string} blockType
 * @return {string}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function enclosingBlockName(document, lineOfSelectedVar, blockType) {
  let currentLineNum = lineOfSelectedVar;
  while (currentLineNum >= 0) {
    const currentLineText = document.lineAt(currentLineNum).text;
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
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @param {number} lineNum
 * @return {number}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function blockClosingBraceLineNum(document, lineNum) {
  const docNbrOfLines = document.lineCount;
  let enclosingBracketFounded = false;
  let nbrOfOpeningBrackets = 1;
  let nbrOfClosingBrackets = 0;
  while (!enclosingBracketFounded && lineNum < docNbrOfLines - 1) {
    lineNum++;
    const currentLineText = document.lineAt(lineNum).text;
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
}

/**
 * Detect all log messages inserted by this extension and then return their ranges
 * @function
 * @param {TextDocument} document
 * @param {number} tabSize
 * @param {string} logMessagePrefix
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @return {Range[]}
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#Range}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.2
 */
function detectAll(document, tabSize, logMessagePrefix) {
  const documentNbrOfLines = document.lineCount;
  const logMessages = [];
  for (let i = 0; i < documentNbrOfLines; i++) {
    const turboConsoleLogMessage = new RegExp(`('|"|\`)${logMessagePrefix}.*`);
    if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
      const logMessageLines = { spaces: 0, lines: [] };
      for (let j = i; j >= 0; j--) {
        let numberOfOpenParenthesis = 0;
        let numberOfCloseParenthesis = 0;
        if (/console\.log/.test(document.lineAt(j).text)) {
          logMessageLines.spaces = spaces(document, j, tabSize);
          for (let k = j; k <= documentNbrOfLines; k++) {
            logMessageLines.lines.push({
              range: document.lineAt(k).rangeIncludingLineBreak
            });
            if (document.lineAt(k).text.match(/\(/g)) {
              numberOfOpenParenthesis += document.lineAt(k).text.match(/\(/g)
                .length;
            }
            if (document.lineAt(k).text.match(/\)/g)) {
              numberOfCloseParenthesis += document.lineAt(k).text.match(/\)/g)
                .length;
            }
            if (
              numberOfOpenParenthesis === numberOfCloseParenthesis &&
              numberOfOpenParenthesis !== 0
            )
              break;
          }
        }
        if (
          numberOfOpenParenthesis === numberOfCloseParenthesis &&
          numberOfOpenParenthesis !== 0
        )
          break;
      }
      logMessages.push(logMessageLines);
    }
  }
  return logMessages;
}

module.exports.message = message;
module.exports.logMessageLine = logMessageLine;
module.exports.spaces = spaces;
module.exports.detectAll = detectAll;
