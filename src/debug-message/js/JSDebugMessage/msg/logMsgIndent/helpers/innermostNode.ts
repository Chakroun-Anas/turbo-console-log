import type { AcornNode } from '../../acorn-utils/types';
import { walk } from '../../acorn-utils/walk';

/** The innermost node of `types` whose lines satisfy `covers`. */
export function innermostNode(
  ast: AcornNode,
  types: Set<string>,
  covers: (firstLine: number, lastLine: number) => boolean,
): AcornNode | undefined {
  let innermost: AcornNode | undefined;
  walk(ast, (node): boolean | void => {
    if (!node.loc) return;
    if (!covers(node.loc.start.line - 1, node.loc.end.line - 1)) return true;
    if (types.has(node.type)) innermost = node;
  });
  return innermost;
}
