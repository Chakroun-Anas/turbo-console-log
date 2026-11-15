import type { AcornNode } from '../../acorn-utils/types';
import type { BlockNode } from '../types';
import { BLOCK_TYPES } from './nodeTypes';

/** Whether `node` holds a list of statements between braces, with its location. */
export function isBlockNode(node: AcornNode): node is BlockNode {
  return BLOCK_TYPES.has(node.type) && Boolean(node.loc);
}
