const vscode = require('vscode')
const logMessage = require('./log-message')

function activate (context) {
  vscode.commands.registerCommand('extension.displayLogMessage', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const selection = editor.selection
    const selectedVar = document.getText(selection)
    const lineOfSelectedVar = selection.active.line
    // Check if the selection line is not the last line in the document
    if (!(lineOfSelectedVar === (document.lineCount - 1))) {
      editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), logMessage.message(editor, selectedVar, lineOfSelectedVar))
      })
    }
  })

  vscode.commands.registerCommand('extension.deleteAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const documentNbrOfLines = document.lineCount
    const linesToDelete = []
    for (let i = 0; i < documentNbrOfLines; i++) {
      if (/console\.log\(.*\)/.test(document.lineAt(i).text)) {
        linesToDelete.push(document.lineAt(i).rangeIncludingLineBreak)
      }
    }
    editor.edit(editBuilder => {
      linesToDelete.forEach(lineToDelete => {
        editBuilder.delete(lineToDelete)
      })
    })
  })
}

exports.activate = activate
