import { Position } from 'vscode';

export class NaturalEditorPosition extends Position {
  constructor(editorDisplayedLine: number, editorDisplayedCharacter: number) {
    super(editorDisplayedLine - 1, editorDisplayedCharacter - 1);
  }
}
