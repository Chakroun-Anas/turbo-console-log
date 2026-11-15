import type { AcornNode } from '../../acorn-utils/types';
import { innermostNode } from './innermostNode';
import { STATEMENT_LIKE_TYPES } from './nodeTypes';

/**
 * The line whose indent the log follows: the first line of the statement
 * holding the selection. A selection on a continuation line of a multi-line
 * statement is indented deeper than the statement, so its own indent says
 * nothing about where the log belongs.
 */
export function anchorLine(ast: AcornNode, selectedVarLine: number): number {
  const statement = innermostNode(
    ast,
    STATEMENT_LIKE_TYPES,
    (first, last) => first <= selectedVarLine && selectedVarLine <= last,
  );
  return statement?.loc ? statement.loc.start.line - 1 : selectedVarLine;
}
