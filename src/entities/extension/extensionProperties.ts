export type ExtensionProperties = {
  wrapLogMessage: boolean;
  logMessagePrefix: string;
  logMessageSuffix: string;
  addSemicolonInTheEnd: boolean;
  insertEnclosingClass: boolean;
  insertEnclosingFunction: boolean;
  insertEmptyLineBeforeLogMessage: boolean;
  insertEmptyLineAfterLogMessage: boolean;
  delimiterInsideMessage: string;
  includeFilename: boolean;
  includeLineNum: boolean;
  quote: string;
  logType: LogType;
  logFunction: string;
};

enum LogType {
  log = 'log',
  warn = 'warn',
  error = 'error',
  debug = 'debug',
  table = 'table',
}
