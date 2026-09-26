import type {
  AcornNode,
  AssignmentExpression,
  ExpressionStatement,
} from './types';
import { isAssignmentExpression, isExpressionStatement } from './guards';
import { pickBySelectionLine } from './bindings';
import { walk } from './walk';

export type AssignmentStatement = ExpressionStatement & {
  expression: AssignmentExpression;
};

/**
 * The statement that assigns to `targetText` (`state = {…}`, `this.state = …`,
 * `client ??= new Client(…)`, `total += …`) and covers the zero-based
 * `selectionLine`. Any assignment operator counts: the target holds the new
 * value once the statement has run, so a log belongs after the statement.
 *
 * The target is matched by its source text, the way the selection reads
 * (`obj[key]`, `this.state`). An assignment nested in a callback on the right
 * side of another one covers the same lines: the statement whose target starts
 * on the selection line wins, the outermost when several do, and the smallest
 * covering statement otherwise.
 */
export function findAssignmentStatement(
  ast: AcornNode,
  sourceCode: string,
  selectionLine: number,
  targetText: string,
): AssignmentStatement | undefined {
  const covering: AssignmentStatement[] = [];

  walk(ast, (node: AcornNode): void => {
    if (!isExpressionStatement(node) || !node.loc) return;
    if (!isAssignmentExpression(node.expression)) return;

    const startLine = node.loc.start.line - 1; // Acorn lines are 1-based
    const endLine = node.loc.end.line - 1;
    if (selectionLine < startLine || selectionLine > endLine) return;

    const { left } = node.expression;
    if (sourceCode.slice(left.start, left.end) !== targetText) return;

    covering.push(node as AssignmentStatement);
  });

  return pickBySelectionLine(
    covering,
    (statement) =>
      // Acorn lines are 1-based
      statement.expression.left.loc?.start.line === selectionLine + 1,
  );
}
