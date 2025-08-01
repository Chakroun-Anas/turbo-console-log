import { TextDocument, TextEditorEdit } from 'vscode';
import { BlockType, ExtensionProperties, Message } from '@/entities';

export interface DebugMessage {
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
    logFunction: string,
  ): void;
  detectAll(
    document: TextDocument,
    logFunction: ExtensionProperties['logFunction'],
    logMessagePrefix: ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
  ): Message[];
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string;
}
