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
  const spacesBeforeMsg = spaces(document, lineOfSelectedVar, tabSize);
  const semicolon = addSemicolonInTheEnd ? ";" : "";
  const debuggingMsg = `console.log(${quote}${logMessagePrefix}: ${classThatEncloseTheVar}${funcThatEncloseTheVar}${selectedVar}${quote}, ${selectedVar})${semicolon}`;
  if (wrapLogMessage) {
    // 16 represents the length of console.log("");
    const wrappingMsg = `console.log(${quote}${logMessagePrefix}: ${"-".repeat(
      debuggingMsg.length - 16
    )}${quote})${semicolon}`;
    return `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}${wrappingMsg}\n`;
  }
  return `${spacesBeforeMsg}${debuggingMsg}\n`;
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
  let selectionLineNbrOfSpaces = 0;
  const selectionLineChars = document.lineAt(line).text.split("");
  for (const char of selectionLineChars) {
    if (char === " ") {
      selectionLineNbrOfSpaces++;
    } else if (char === "\t") {
      selectionLineNbrOfSpaces += tabSize;
    } else {
      break;
    }
  }
  if (/{/.test(document.lineAt(line).text)) {
    let lineNextToSelectionLineNbrOfSpaces = 0;
    const lineNextToSelectionLineChars = document
      .lineAt(line + 1)
      .text.split("");
    for (const char of lineNextToSelectionLineChars) {
      if (char === " ") {
        lineNextToSelectionLineNbrOfSpaces++;
      } else if (char === "\t") {
        lineNextToSelectionLineNbrOfSpaces += tabSize;
      } else {
        break;
      }
    }
    if (
      selectionLineNbrOfSpaces % tabSize === 0 &&
      lineNextToSelectionLineNbrOfSpaces % tabSize === 0
    ) {
      selectionLineNbrOfSpaces = selectionLineNbrOfSpaces / tabSize;
      lineNextToSelectionLineNbrOfSpaces =
        lineNextToSelectionLineNbrOfSpaces / tabSize;
      return selectionLineNbrOfSpaces > lineNextToSelectionLineNbrOfSpaces
        ? "\t".repeat(selectionLineNbrOfSpaces)
        : "\t".repeat(lineNextToSelectionLineNbrOfSpaces);
    } else {
      return selectionLineNbrOfSpaces > lineNextToSelectionLineNbrOfSpaces
        ? " ".repeat(selectionLineNbrOfSpaces)
        : " ".repeat(lineNextToSelectionLineNbrOfSpaces);
    }
  } else {
    if (selectionLineNbrOfSpaces % tabSize === 0) {
      selectionLineNbrOfSpaces = selectionLineNbrOfSpaces / tabSize;
      return "\t".repeat(selectionLineNbrOfSpaces);
    }
    return " ".repeat(selectionLineNbrOfSpaces);
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
          lineCodeProcessing.checkIfNamedFunction(currentLineText) &&
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
    const turboConsoleLogMessage = new RegExp(`('|")${logMessagePrefix}.*`);
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
module.exports.spaces = spaces;
module.exports.detectAll = detectAll;
