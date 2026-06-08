/**
 * Constructs the complete debugging message with optional wrapping.
 */

import type { ExtensionProperties } from '@/entities';
import { getLogFunction } from '../helpers/getLogFunction';

const WRAPPER_OFFSET = 16;

/**
 * Build the final debug message with proper indentation and optional wrapping.
 *
 * @param extensionProperties Extension configuration
 * @param debuggingMsgContent The content of the debugging message
 * @param spacesBeforeMsg Indentation string
 * @param logFunction The PHP logging function
 * @returns The complete formatted debug message
 */
export function constructDebuggingMsg(
  extensionProperties: ExtensionProperties,
  debuggingMsgContent: string,
  spacesBeforeMsg: string,
  logFunction: string,
): string {
  // Construct wrapping message if enabled.
  // PHP statements always end with a semicolon (omitting it is a syntax error),
  // so the wrapper lines terminate with ';' regardless of `addSemicolonInTheEnd`.
  const wrappingMsg = `${getLogFunction(logFunction)}(${extensionProperties.quote}${
    extensionProperties.logMessagePrefix
  } ${'-'.repeat(debuggingMsgContent.length - WRAPPER_OFFSET)}${
    extensionProperties.logMessagePrefix
  }${extensionProperties.quote});`;

  const debuggingMsg: string = extensionProperties.wrapLogMessage
    ? `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsgContent}\n${spacesBeforeMsg}${wrappingMsg}`
    : `${spacesBeforeMsg}${debuggingMsgContent}`;

  return debuggingMsg;
}
