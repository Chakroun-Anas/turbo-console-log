import { TextDocument, TextEditorEdit } from 'vscode';
import { ExtensionProperties, Message } from '../../../entities';
import { DebugMessage } from '../../DebugMessage';
import { detectAll } from './detectAll';
import { msg } from './msg';

export const jsDebugMessage: DebugMessage = {
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
    logFunction: string,
  ): void {
    msg(
      textEditor,
      document,
      selectedVar,
      lineOfSelectedVar,
      tabSize,
      extensionProperties,
      logFunction,
    );
  },
  async detectAll(
    fs: typeof import('fs'),
    vscode: typeof import('vscode'),
    filePath: string,
    logFunction: ExtensionProperties['logFunction'],
    logMessagePrefix: ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
  ): Promise<Message[]> {
    return detectAll(
      fs,
      vscode,
      filePath,
      logFunction,
      logMessagePrefix,
      delimiterInsideMessage,
    );
  },
};
