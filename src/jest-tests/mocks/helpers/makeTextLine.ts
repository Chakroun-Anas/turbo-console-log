import { TextLine } from 'vscode';

export const makeTextLine = (text: string) =>
  ({
    text,
    rangeIncludingLineBreak: {},
  }) as unknown as TextLine;
