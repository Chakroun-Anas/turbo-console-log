import type { TurboTextDocument } from '../../../detectAll/TurboTextDocument';
import type { AcornNode } from '../../acorn-utils/types';
import type { BlockNode } from '../types';
import { innermostNode } from './innermostNode';
import { isBlockNode } from './isBlockNode';
import { BLOCK_TYPES } from './nodeTypes';

/**
 * The block a new log opens: the log goes inside it, above any statement, on
 * a line with no indent to copy (blank, or the closing brace of an empty
 * block). Null otherwise: the caller then falls back to the anchor rule.
 */
export function blockOpenedByLog(
  document: TurboTextDocument,
  logMsgLine: number,
  ast: AcornNode,
): BlockNode | null {
  const block = innermostNode(
    ast,
    BLOCK_TYPES,
    (first, last) => first < logMsgLine && logMsgLine <= last,
  );
  if (!block || !isBlockNode(block)) return null;

  const isBlank = document.lineAt(logMsgLine).text.trim() === '';
  // Empty block: the log lands on its closing brace, whose indent is one level too shallow
  if (!isBlank && logMsgLine !== block.loc.end.line - 1) return null;

  // A statement above the log means the log does not open the block
  const [firstStatement] = block.body;
  if (firstStatement?.loc && firstStatement.loc.start.line - 1 < logMsgLine) {
    return null;
  }
  return block;
}
