const vscode = require('vscode')
const lineCodeProcessing = require('./line-code-processing')

/**
 * Return a log message on the following format: ClassThatEncloseTheSelectedVar -> FunctionThatEncloseTheSelectedVar -> TheSelectedVar, SelectedVarValue
 * @function
 * @param {TextEditor} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextEditor}
 * @param {string} selectedVar
 * @param {number} lineOfSelectedVar
 * @param {boolean} wrapLogMessage
 * @returns {string}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function message (editor, selectedVar, lineOfSelectedVar, wrapLogMessage) {
  const classThatEncloseTheVar = enclosingBlockName(editor.document, lineOfSelectedVar, 'class')
  const funcThatEncloseTheVar = enclosingBlockName(editor.document, lineOfSelectedVar, 'function')
  const msgTabs = tabs(editor, lineOfSelectedVar);
  const debuggingMsg = `\u200bconsole.log('${classThatEncloseTheVar}${funcThatEncloseTheVar}${selectedVar}', ${selectedVar});`
  if(wrapLogMessage) {
    // 16 represents the length of console.log('');
    const wrappingMsg = `\u200bconsole.log('${'-'.repeat(debuggingMsg.length - 16)}');`
    return `${msgTabs}${wrappingMsg}\n${msgTabs}${debuggingMsg}\n${msgTabs}${wrappingMsg}\n`
  }
  return `${msgTabs}${debuggingMsg}\n`
}

/**
 * Tabs to insert before the log message
 * @function
 * @param {TextEditor} editor
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextEditor}
 * @param {number} currentSelectionLine
 * @returns {string} Tabs
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function tabs (editor, currentSelectionLine) {
  const document = editor.document
  let nbrOfTabs = 0
  if (document.lineAt(new vscode.Position(currentSelectionLine + 1, 0)).isEmptyOrWhitespace) {
    nbrOfTabs = document.lineAt(new vscode.Position(currentSelectionLine, 0)).firstNonWhitespaceCharacterIndex / editor.options.tabSize
  } else {
    if(document.lineAt(new vscode.Position(currentSelectionLine + 1, 0)).firstNonWhitespaceCharacterIndex 
          > document.lineAt(new vscode.Position(currentSelectionLine, 0)).firstNonWhitespaceCharacterIndex) {
      nbrOfTabs = (document.lineAt(new vscode.Position(currentSelectionLine + 1, 0)).firstNonWhitespaceCharacterIndex) / editor.options.tabSize
    } else {
      nbrOfTabs = (document.lineAt(new vscode.Position(currentSelectionLine, 0)).firstNonWhitespaceCharacterIndex) / editor.options.tabSize
    }
  }
  return '\t'.repeat(nbrOfTabs)
}
/**
 * Return the name of the enclosing block whether if it's a class or a function
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @param {number} lineOfSelectedVar
 * @param {string} blockType
 * @returns {string}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function enclosingBlockName (document, lineOfSelectedVar, blockType) {
  let currentLineNum = lineOfSelectedVar
  while (currentLineNum >= 0) {
    const currentLineText = document.lineAt(currentLineNum).text
    switch (blockType) {
      case 'class':
        if (lineCodeProcessing.checkClassDeclaration(currentLineText)) {
          if (lineOfSelectedVar > currentLineNum && lineOfSelectedVar < blockClosingBraceLineNum(document, currentLineNum)) {
            return `${lineCodeProcessing.className(currentLineText)} -> `
          }
        }
        break
      case 'function':
        if (lineCodeProcessing.checkIfNamedFunction(currentLineText) && !lineCodeProcessing.checkIfJSBuiltInStatement(currentLineText)) {
          if (lineOfSelectedVar >= currentLineNum && lineOfSelectedVar < blockClosingBraceLineNum(document, currentLineNum)) {
            return `${lineCodeProcessing.functionName(currentLineText)} -> `
          }
        }
        break
    }
    currentLineNum--
  }
  return ''
}

/**
 * Return the number line of the block's closing brace
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @param {number} lineNum
 * @returns {number}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function blockClosingBraceLineNum (document, lineNum) {
  const docNbrOfLines = document.lineCount
  let enclosingBracketFounded = false
  let nbrOfOpeningBrackets = 1
  let nbrOfClosingBrackets = 0
  while (!enclosingBracketFounded && lineNum < (docNbrOfLines - 1)) {
    lineNum++
    const currentLineText = document.lineAt(lineNum).text
    if (/{/.test(currentLineText)) {
      nbrOfOpeningBrackets++
    }
    if (/}/.test(currentLineText)) {
      nbrOfClosingBrackets++
    }
    if (nbrOfOpeningBrackets === nbrOfClosingBrackets) {
      enclosingBracketFounded = true
      return lineNum
    }
  }
}

/** 
 * Detect all log messages inserted by this extension and then return their ranges 
 * @function
 * @param {TextDocument} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument}
 * @returns {Range[]}
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#Range}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.2
*/
function detectAll(document) {
  const documentNbrOfLines = document.lineCount
    const logMessagesRanges = []
    for (let i = 0; i < documentNbrOfLines; i++) {
      if (/\u200bconsole\.log\(.*\)/.test(document.lineAt(i).text)) {
        logMessagesRanges.push(document.lineAt(i).rangeIncludingLineBreak)
      }
    }
    return logMessagesRanges
}

module.exports.message   = message
module.exports.detectAll = detectAll