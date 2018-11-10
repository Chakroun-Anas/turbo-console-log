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
        editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), 
              logMessage.message(document, selectedVar, lineOfSelectedVar, wrapLogMessage, tabSize))
      })
    }
  })
  vscode.commands.registerCommand('turboConsoleLog.commentAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const tabSize = editor.options.tabSize
    const document = editor.document
    const logMessages = logMessage.detectAll(document)
    editor.edit(editBuilder => {
      logMessages.forEach(logMessageLines => {
        logMessageLines.forEach(({line, range}) => {
          editBuilder.delete(range)
          editBuilder.insert(new vscode.Position(range.start.line, 0), `${logMessage.spaces(document, line, tabSize )}// ${document.getText(range).trim()}\n`)
        });
      })
    })
  })
  vscode.commands.registerCommand('turboConsoleLog.uncommentAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const tabSize = editor.options.tabSize
    const document = editor.document
    const logMessages = logMessage.detectAll(document)
    editor.edit(editBuilder => {
      logMessages.forEach(logMessageLines => {
        logMessageLines.forEach(({line, range}) => {
          editBuilder.delete(range)
          editBuilder.insert(new vscode.Position(range.start.line, 0), `${logMessage.spaces(document, line, tabSize )}${document.getText(range).replace(/\//g, '').trim()}\n`)
        });
      })
    })
  })
  vscode.commands.registerCommand('turboConsoleLog.deleteAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const logMessages = logMessage.detectAll(editor.document)
    editor.edit(editBuilder => {
      logMessages.forEach(logMessageLines => {
        logMessageLines.forEach(({range}) => {
          editBuilder.delete(range)
        });ç
      })
    })
  })
}

exports.activate = activate
