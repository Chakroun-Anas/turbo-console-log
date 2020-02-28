const vscode = require("vscode");
const path = require("path");
const mocha = require("mocha");
const describe = mocha.describe;
const before = mocha.before;
const after = mocha.after;
const afterEach = mocha.afterEach;
const chai = require("chai");
const expect = chai.expect;
const it = mocha.it;

describe("Turbo Console Log", () => {
  before(async () => {
    vscode.window.showInformationMessage("Running integration tests");
  });
  afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
  timeoutIt("Insert log message related to a primitive variable", async () => {
    await openDocument("../files/js/primitiveVariable.js");
    const { activeTextEditor } = vscode.window;
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(0, 6),
        new vscode.Position(0, 14)
      )
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(1).text;
    expect(logMessage).to.match(/console\.log\(.*/);
  });
  timeoutIt("Insert log message related to an object variable", async () => {
    await openDocument("../files/js/objectVariable.js");
    const { activeTextEditor } = vscode.window;
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(0, 6),
        new vscode.Position(0, 12)
      )
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(4).text;
    expect(logMessage).to.match(/console\.log\(.*/);
  });
  timeoutIt("Insert log message related to a function parameter", async () => {
    await openDocument("../files/js/function.js");
    const { activeTextEditor } = vscode.window;
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(0, 18),
        new vscode.Position(0, 26)
      )
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(1).text;
    expect(logMessage).to.match(/console\.log\(.*/);
    expect(logMessage).to.include("sayHello");
  });
  timeoutIt(
    "Insert log message related to a class constructor parameter",
    async () => {
      await openDocument("../files/js/classConstructor.js");
      const { activeTextEditor } = vscode.window;
      activeTextEditor.selections = [
        new vscode.Selection(
          new vscode.Position(1, 14),
          new vscode.Position(1, 22)
        )
      ];
      await vscode.commands.executeCommand(
        "turboConsoleLog.displayLogMessage",
        []
      );
      const textDocument = activeTextEditor.document;
      const logMessage = textDocument.lineAt(2).text;
      expect(logMessage).to.match(/console\.log\(.*/);
      // Class name
      expect(logMessage).to.include("Person");
      // Function name
      expect(logMessage).to.include("constructor");
    }
  );
  timeoutIt(
    "Insert log message related to a class function parameter",
    async () => {
      await openDocument("../files/js/classFunction.js");
      const { activeTextEditor } = vscode.window;
      activeTextEditor.selections = [
        new vscode.Selection(
          new vscode.Position(1, 11),
          new vscode.Position(1, 19)
        )
      ];
      await vscode.commands.executeCommand(
        "turboConsoleLog.displayLogMessage",
        []
      );
      const textDocument = activeTextEditor.document;
      const logMessage = textDocument.lineAt(2).text;
      expect(logMessage).to.match(/console\.log\(.*/);
      // Class name
      expect(logMessage).to.include("Person");
      // Function name
      expect(logMessage).to.include("sayHello");
    }
  );
  timeoutIt(
    "Insert log message related to a function parameter within a class function",
    async () => {
      await openDocument("../files/js/classNestedFunction.js");
      const { activeTextEditor } = vscode.window;
      activeTextEditor.selections = [
        new vscode.Selection(
          new vscode.Position(2, 29),
          new vscode.Position(2, 41)
        )
      ];
      await vscode.commands.executeCommand(
        "turboConsoleLog.displayLogMessage",
        []
      );
      const textDocument = activeTextEditor.document;
      const logMessage = textDocument.lineAt(3).text;
      expect(logMessage).to.match(/console\.log\(.*/);
      // Class name
      expect(logMessage).to.include("Person");
      // Function name
      expect(logMessage).to.include("anotherFunction");
      // Variable name
      expect(logMessage).to.include("anotherParam");
    }
  );
  after(async () => {
    vscode.window.showInformationMessage("Done");
  });
});

async function openDocument(documentPath) {
  const uri = path.join(__dirname, documentPath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
}

function timeoutIt(description, callback) {
  return it(description, callback).timeout(10000);
}
