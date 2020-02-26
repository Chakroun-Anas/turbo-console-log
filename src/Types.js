// @flow

const vscode = require("vscode");

export type JSBlockType = "class" | "function";

export type LogMessage = {
  spaces: string,
  lines: vscode.Range[]
};

export type ExtensionProperties = {
  wrapLogMessage: boolean,
  logMessagePrefix: string,
  addSemicolonInTheEnd: boolean,
  insertEnclosingClass: boolean,
  insertEnclosingFunction: boolean,
  quote: string
};
