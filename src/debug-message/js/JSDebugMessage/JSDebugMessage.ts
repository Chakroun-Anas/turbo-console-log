import { TextDocument, TextEditorEdit } from 'vscode';
import { BlockType, ExtensionProperties, Message } from '../../../entities';
import { DebugMessage } from '../../DebugMessage';
import { enclosingBlockName } from './enclosingBlockName';
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
    logMessagePrefix: ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
  ): Message[] {
    return detectAll(
      document,
      logFunction,
      logMessagePrefix,
      delimiterInsideMessage,
    );
  },
};
