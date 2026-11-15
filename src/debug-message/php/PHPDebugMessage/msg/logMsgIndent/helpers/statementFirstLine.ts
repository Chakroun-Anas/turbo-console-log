import type { PHPNode, Program } from '../../php-parser-utils/types';
import { walk } from '../../php-parser-utils/walk';
import { STATEMENT_KINDS } from './nodeKinds';

/** The first line of the innermost statement covering `line`. */
export function statementFirstLine(
  ast: Program,
  line: number,
): number | undefined {
  let firstLine: number | undefined;
  walk(ast, (node: PHPNode): boolean | void => {
    if (!node.loc) return;
    if (line < node.loc.start.line - 1 || line > node.loc.end.line - 1) {
      return false;
    }
    if (STATEMENT_KINDS.has(node.kind)) firstLine = node.loc.start.line - 1;
  });
  return firstLine;
}
