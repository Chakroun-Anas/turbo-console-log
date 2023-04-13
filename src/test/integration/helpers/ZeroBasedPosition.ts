import {Position} from "vscode";

export class ZeroBasedPosition extends Position {
    constructor(editorDisplayedLine: number, editorDisplayedCharacter: number) {
        super(editorDisplayedLine - 1, editorDisplayedCharacter - 1)
    }
}