import { parser } from '@lezer/python';
import type { TextDocument } from 'vscode';
import type { PythonProgram } from './types';

function buildLineOffsets(text: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

export function parseCode(document: TextDocument): PythonProgram {
  const text = document.getText();
  const tree = parser.parse(text);
  const lineOffsets = buildLineOffsets(text);

  const lines: string[] = [];
  for (let i = 0; i < document.lineCount; i++) {
    lines.push(document.lineAt(i).text);
  }

  return { tree, lines, lineOffsets };
}
