export type ExtensionProperties = {
  wrapLogMessage: boolean;
  logMessagePrefix: string;
  logMessageSuffix: string;
  addSemicolonInTheEnd: boolean;
  insertEnclosingClass: boolean;
  logCorrectionNotificationEnabled: boolean;
  insertEnclosingFunction: boolean;
  insertEmptyLineBeforeLogMessage: boolean;
  insertEmptyLineAfterLogMessage: boolean;
  delimiterInsideMessage: string;
  includeFilename: boolean;
  includeLineNum: boolean;
  quote: string;
  logFunction: string;
  releaseReviewTargetWindow: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
};
