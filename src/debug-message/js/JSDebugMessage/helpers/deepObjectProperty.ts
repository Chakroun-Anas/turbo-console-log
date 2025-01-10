import { TextDocument } from 'vscode';
import { MultilineContextVariable, BracketType } from '../../../../entities';
import { LineCodeProcessing } from '../../../../line-code-processing';
import {
  getMultiLineContextVariable,
  closingContextLine,
} from '../../../../utilities';

export function deepObjectProperty(
  document: TextDocument,
  line: number,
  path = '',
  lineCodeProcessing: LineCodeProcessing,
): { path: string; line: number } | null {
  const lineText = document.lineAt(line).text;
  const propertyNameRegex = /(\w+):\s*\{/;
  const propertyNameRegexMatch = propertyNameRegex.exec(lineText);
  if (propertyNameRegexMatch) {
    const multilineBracesVariable: MultilineContextVariable | null =
      getMultiLineContextVariable(document, line, BracketType.CURLY_BRACES);
    if (multilineBracesVariable) {
      return deepObjectProperty(
        document,
        multilineBracesVariable.openingContextLine,
        `${propertyNameRegexMatch[1]}.${path}`,
        lineCodeProcessing,
      );
    }
  } else if (
    lineCodeProcessing.isObjectLiteralAssignedToVariable(
      `${document.lineAt(line).text}${document.lineAt(line + 1).text})}`,
    )
  ) {
    return {
      path: `${document
        .lineAt(line)
        .text.split('=')[0]
        .replace(/(const|let|var)/, '')
        .trim()}.${path}`,
      line: closingContextLine(document, line, BracketType.CURLY_BRACES),
    };
  }
  return null;
}
