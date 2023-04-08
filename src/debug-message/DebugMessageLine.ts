import { TextDocument } from 'vscode';
import { LogMessage } from '../entities';

export interface DebugMessageLine {
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number;
}
