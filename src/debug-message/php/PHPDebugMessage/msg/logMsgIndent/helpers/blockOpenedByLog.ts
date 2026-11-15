import type { TurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';
import type { PHPNode, Program } from '../../php-parser-utils/types';
import { walk } from '../../php-parser-utils/walk';
import type { BlockNode } from '../types';
import { isBlockNode } from './isBlockNode';

/**
 * The block a new log opens: the log goes inside it, above any statement, on
 * a line with no indent to copy (blank, or the closing brace of an empty
 * block). Null otherwise: the caller then falls back to the anchor rule.
 */
export function blockOpenedByLog(
  document: TurboTextDocument,
  logMsgLine: number,
  ast: Program,
): BlockNode | null {
  let block: BlockNode | undefined;
  walk(ast, (node: PHPNode): boolean | void => {
    if (!node.loc) return;
    if (
      logMsgLine <= node.loc.start.line - 1 ||
      logMsgLine > node.loc.end.line - 1
    ) {
      return false;
    }
    if (isBlockNode(node)) block = node;
  });
  if (!block) return null;

  const isBlank = document.lineAt(logMsgLine).text.trim() === '';
  // Empty block: the log lands on its closing brace, whose indent is one level too shallow
  if (!isBlank && logMsgLine !== block.loc.end.line - 1) return null;

  // A statement above the log means the log does not open the block
  const [firstStatement] = block.children;
  if (firstStatement?.loc && firstStatement.loc.start.line - 1 < logMsgLine) {
    return null;
  }
  return block;
}
