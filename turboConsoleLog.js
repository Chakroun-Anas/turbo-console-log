const vscode = require('vscode')
const logMessage = require('./log-message')

function activate (context) {
  vscode.commands.registerCommand('turboConsoleLog.displayLogMessage', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const tabSize = editor.options.tabSize
    const document = editor.document
    const selection = editor.selection
    const selectedVar = document.getText(selection)
    const lineOfSelectedVar = selection.active.line
    // Check if the selection line is not the last one in the document and the selected variable is not empty
    if (!(lineOfSelectedVar === (document.lineCount - 1)) && selectedVar.trim().length !== 0) {
      editor.edit(editBuilder => {
        const wrapLogMessage   = vscode.workspace.getConfiguration().wrapLogMessage || false;
        const logMessagePrefix = vscode.workspace.getConfiguration().logMessagePrefix || "TCL: ";
        editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), 
              logMessage.message(document, selectedVar, lineOfSelectedVar, wrapLogMessage, logMessagePrefix, tabSize))
      })
    }
  })
  vscode.commands.registerCommand('turboConsoleLog.commentAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const logMessagePrefix = vscode.workspace.getConfiguration().logMessagePrefix || "TCL: ";
    const logMessagesRanges = logMessage.detectAll(document, logMessagePrefix)
    editor.edit(editBuilder => {
      logMessagesRanges.forEach(logMessageRange => {
        let nbrOfSpaces = 0
        nbrOfSpaces = document.lineAt(logMessageRange.start).firstNonWhitespaceCharacterIndex
        editBuilder.delete(logMessageRange)
        editBuilder.insert(new vscode.Position(logMessageRange.start.line, 0), `${' '.repeat(nbrOfSpaces)}// ${document.getText(logMessageRange).trim()}\n`)
      })
    })
  })
  vscode.commands.registerCommand('turboConsoleLog.uncommentAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const logMessagePrefix = vscode.workspace.getConfiguration().logMessagePrefix || "TCL: ";
    const logMessagesRanges = logMessage.detectAll(document, logMessagePrefix)
    editor.edit(editBuilder => {
      logMessagesRanges.forEach(logMessageRange => {
        let nbrOfSpaces = 0
        nbrOfSpaces = document.lineAt(logMessageRange.start).firstNonWhitespaceCharacterIndex
        editBuilder.delete(logMessageRange)
        editBuilder.insert(new vscode.Position(logMessageRange.start.line, 0), `${' '.repeat(nbrOfSpaces)}${document.getText(logMessageRange).replace(/\//g, '').trim()}\n`)
      })
    })
  })
  vscode.commands.registerCommand('turboConsoleLog.deleteAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const logMessagePrefix = vscode.workspace.getConfiguration().logMessagePrefix || "TCL: ";
    const logMessagesRanges = logMessage.detectAll(editor.document, logMessagePrefix)
    editor.edit(editBuilder => {
      logMessagesRanges.forEach(logMessageRange => {
        editBuilder.delete(logMessageRange)
      })
    })
  })
}

exports.activate = activate
