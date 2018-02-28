const vscode = require('vscode')
const lineCodeProcessing = require('./line-code-processing')

/**
 * Return a log message on the following format: ClassThatEncloseTheSelectedVar -> FunctionThatEncloseTheSelectedVar -> TheSelectedVar, SelectedVarValue
 * @function
 * @param {TextEditor} document
 * @see {@link https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextEditor}
 * @param {string} selectedVar
 * @param {number} lineOfSelectedVar
 * @returns {string}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function message (editor, selectedVar, lineOfSelectedVar) {
  const classThatEncloseTheVar = enclosingBlockName(editor.document, lineOfSelectedVar, 'class')
  const funcThatEncloseTheVar = enclosingBlockName(editor.document, lineOfSelectedVar, 'function')
  return `${tabs(editor, lineOfSelectedVar)}console.log('${classThatEncloseTheVar}${funcThatEncloseTheVar}${selectedVar}', ${selectedVar})\n`
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

module.exports.message = message
