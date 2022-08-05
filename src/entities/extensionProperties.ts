export type ExtensionProperties = {
  wrapLogMessage: boolean;
  logMessagePrefix: string;
  addSemicolonInTheEnd: boolean;
  insertEnclosingClass: boolean;
  insertEnclosingFunction: boolean;
  delimiterInsideMessage: string;
  includeFileName: boolean,
  includeLineNum: boolean,
  quote: string;
  logType: enumLogType;
  logFunction: string;
};

enum enumLogType {
  log = "log",
  warn = "warn",
  error = "error",
  debug = "debug",
  table = "table",
}

