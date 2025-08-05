/**
 * Constructs the final debugging message with optional wrapping.
 */

import { ExtensionProperties } from '@/entities';
import { getLogFunction } from '../helpers/getLogFunction';

const WRAPPER_OFFSET = 16;

/**
 * Constructs the final debugging message with optional wrapping.
 * @param extensionProperties Configuration properties for the extension
 * @param debuggingMsgContent The content of the debugging message
 * @param spacesBeforeMsg Indentation spaces before the message
 * @returns The complete debugging message string
 */
export function constructDebuggingMsg(
  extensionProperties: ExtensionProperties,
  debuggingMsgContent: string,
  spacesBeforeMsg: string,
  logFunction: string,
): string {
  const wrappingMsg = `${getLogFunction(logFunction)}(${extensionProperties.quote}${
    extensionProperties.logMessagePrefix
  } ${'-'.repeat(debuggingMsgContent.length - WRAPPER_OFFSET)}${
    extensionProperties.logMessagePrefix
  }${extensionProperties.quote})${
    extensionProperties.addSemicolonInTheEnd ? ';' : ''
  }`;
  const debuggingMsg: string = extensionProperties.wrapLogMessage
    ? `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsgContent}\n${spacesBeforeMsg}${wrappingMsg}`
    : `${spacesBeforeMsg}${debuggingMsgContent}`;
  return debuggingMsg;
}
