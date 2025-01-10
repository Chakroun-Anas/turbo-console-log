import { TextDocument } from 'vscode';
import { BlockType, BracketType } from '../../../../entities';
import { closingContextLine } from '../../../../utilities';
import { LineCodeProcessing } from '../../../../line-code-processing/';

export function enclosingBlockName(
  document: TextDocument,
  lineOfSelectedVar: number,
  blockType: BlockType,
  lineCodeProcessing: LineCodeProcessing,
): string {
  let currentLineNum: number = lineOfSelectedVar;
  while (currentLineNum >= 0) {
    const currentLineText: string = document.lineAt(currentLineNum).text;
    switch (blockType) {
      case 'class':
        if (lineCodeProcessing.doesContainClassDeclaration(currentLineText)) {
          if (
            lineOfSelectedVar > currentLineNum &&
            lineOfSelectedVar <
              closingContextLine(
                document,
                currentLineNum,
                BracketType.CURLY_BRACES,
              )
          ) {
            return `${lineCodeProcessing.getClassName(currentLineText)}`;
          }
        }
        break;
      case 'function':
        if (
          lineCodeProcessing.doesContainsNamedFunctionDeclaration(
            currentLineText,
          ) &&
          !lineCodeProcessing.doesContainsBuiltInFunction(currentLineText)
        ) {
          if (
            lineOfSelectedVar >= currentLineNum &&
            lineOfSelectedVar <
              closingContextLine(
                document,
                currentLineNum,
                BracketType.CURLY_BRACES,
              )
          ) {
            if (
              lineCodeProcessing.getFunctionName(currentLineText).length !== 0
            ) {
              return `${lineCodeProcessing.getFunctionName(currentLineText)}`;
            }
            return '';
          }
        }
        break;
    }
    currentLineNum--;
  }
  return '';
}
