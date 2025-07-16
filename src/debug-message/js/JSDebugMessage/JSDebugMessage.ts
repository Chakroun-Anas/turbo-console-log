import { TextDocument, TextEditorEdit } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  Message,
  LogMessage,
} from '../../../entities';
import { DebugMessage } from '../../DebugMessage';
import { logMessage } from './logMessage';
import { enclosingBlockName } from './enclosingBlockName';
import { detectAll } from './detectAll';
import { msg } from './msg';
import { JSDebugMessageAnonymous } from '../JSDebugMessageAnonymous';

const jsDebugMessageAnonymous = new JSDebugMessageAnonymous();

export const jsDebugMessage: DebugMessage = {
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void {
    msg(
      textEditor,
      document,
      selectedVar,
      lineOfSelectedVar,
      tabSize,
      extensionProperties,
      jsDebugMessageAnonymous,
    );
  },
  logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): LogMessage {
    return logMessage(document, selectionLine, selectedVar);
  },
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string {
    return enclosingBlockName(document, lineOfSelectedVar, blockType);
  },
  detectAll(
    document: TextDocument,
    logFunction: ExtensionProperties['logFunction'],
    logType: ExtensionProperties['logType'],
    logMessagePrefix: ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
    args?: unknown[],
  ): Message[] {
    return detectAll(
      document,
      logFunction,
      logType,
      logMessagePrefix,
      delimiterInsideMessage,
      args,
    );
  },
};
