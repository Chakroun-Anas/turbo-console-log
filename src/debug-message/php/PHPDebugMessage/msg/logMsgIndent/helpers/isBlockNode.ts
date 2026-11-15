import { isBlock } from '../../php-parser-utils/guards';
import type { PHPNode } from '../../php-parser-utils/types';
import type { BlockNode } from '../types';

/** Whether `node` is a block of statements, with its location. */
export function isBlockNode(node: PHPNode): node is BlockNode {
  return isBlock(node) && Boolean(node.loc);
}
