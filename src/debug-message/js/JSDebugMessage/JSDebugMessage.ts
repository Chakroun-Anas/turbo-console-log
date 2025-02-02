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
import { JSLineCodeProcessing } from '../../../line-code-processing/js';
import { LineCodeProcessing } from '../../../line-code-processing';
import { JSDebugMessageAnonymous } from '../JSDebugMessageAnonymous';
import { jsDebugMessageLine } from '../JSDebugMessageLine/';

const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
const jsDebugMessageAnonymous = new JSDebugMessageAnonymous(
  jsLineCodeProcessing,
);

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
      jsLineCodeProcessing,
      jsDebugMessageLine,
      jsDebugMessageAnonymous,
    );
  },
  logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): LogMessage {
    return logMessage(
      document,
      selectionLine,
      selectedVar,
      jsLineCodeProcessing,
    );
  },
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string {
    return enclosingBlockName(
      document,
      lineOfSelectedVar,
      blockType,
      jsLineCodeProcessing,
    );
  },
  detectAll(
    document: TextDocument,
    logFunction: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[] {
    return detectAll(
      document,
      logFunction,
      logMessagePrefix,
      delimiterInsideMessage,
    );
  },
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    return jsDebugMessageLine.line(
      document,
      selectionLine,
      selectedVar,
      logMsg,
    );
  },
};
