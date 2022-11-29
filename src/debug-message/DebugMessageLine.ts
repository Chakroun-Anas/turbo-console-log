import { TextDocument } from 'vscode';
import { LogMessageType } from '../entities';

export interface DebugMessageLine {
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsgType: LogMessageType,
  ): number;
}
