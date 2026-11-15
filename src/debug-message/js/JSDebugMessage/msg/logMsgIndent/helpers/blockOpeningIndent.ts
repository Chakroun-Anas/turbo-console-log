import type { TurboTextDocument } from '../../../detectAll/TurboTextDocument';
import { indentUnit, leadingWhitespace } from '@/utilities/indentation';
import type { BlockNode } from '../types';

/**
 * The indent of a log opening `block`: the indent of its first statement, or
 * one level deeper than the line opening the block when it is empty.
 */
export function blockOpeningIndent(
  document: TurboTextDocument,
  block: BlockNode,
  tabSize: number,
): string {
  // The log goes on a blank line above the first statement: copy its indent
  const [firstStatement] = block.body;
  if (firstStatement?.loc) {
    return leadingWhitespace(
      document.lineAt(firstStatement.loc.start.line - 1).text,
    );
  }

  const blockIndent = leadingWhitespace(
    document.lineAt(block.loc.start.line - 1).text,
  );
  return blockIndent + indentUnit(document, blockIndent, tabSize);
}
