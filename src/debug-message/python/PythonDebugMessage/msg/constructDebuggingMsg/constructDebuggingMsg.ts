import type { ExtensionProperties } from '@/entities';
import { selectPythonQuote } from '../constructDebuggingMsgContent/helpers/selectQuote/selectQuote';

const WRAPPER_OFFSET = 16;

export function constructDebuggingMsg(
  extensionProperties: ExtensionProperties,
  debuggingMsgContent: string,
  spacesBeforeMsg: string,
  logFunction: string,
): string {
  const q = selectPythonQuote(
    extensionProperties.quote,
    extensionProperties.logMessagePrefix,
  );
  // Python statements never end with a semicolon (flake8 E703), so the
  // `addSemicolonInTheEnd` setting is intentionally ignored for the wrapper too.
  const dashes = '-'.repeat(
    Math.max(debuggingMsgContent.length - WRAPPER_OFFSET, 4),
  );
  const wrapperMsg = `${logFunction}(${q}${extensionProperties.logMessagePrefix} ${dashes}${extensionProperties.logMessagePrefix}${q})`;

  if (extensionProperties.wrapLogMessage) {
    return [
      `${spacesBeforeMsg}${wrapperMsg}`,
      `${spacesBeforeMsg}${debuggingMsgContent}`,
      `${spacesBeforeMsg}${wrapperMsg}`,
    ].join('\n');
  }

  return `${spacesBeforeMsg}${debuggingMsgContent}`;
}
