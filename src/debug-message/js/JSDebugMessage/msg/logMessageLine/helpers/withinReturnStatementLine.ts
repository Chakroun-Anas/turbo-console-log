import { TextDocument } from 'vscode';
import {
  type AcornNode,
  findEnclosingStatement,
  findSelectionReturnStatement,
  isArrowFunctionExpression,
  parameterList,
  patternBindsName,
  statementLines,
  walk,
} from '../../acorn-utils';

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

/**
 * AST-driven helper to determine the line where to place the log message for a variable within a return statement
 * @param document - The VS Code text document
 * @param selectionLine - The line where the variable is selected
 * @param variableName - The selected variable name
 * @returns The line of the return statement the selection belongs to (the log
 * goes before it), or the next line when there is none
 */
export function withinReturnStatementLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const returnStatement = findSelectionReturnStatement(
    ast,
    document,
    selectionLine,
    variableName,
  );
  if (!returnStatement) return selectionLine + 1;
  const { before, after } = statementLines(ast, document, returnStatement);
  return (
    before ??
    outerStatementLine(ast, document, returnStatement, variableName.trim()) ??
    after
  );
}

/**
 * A return in a function body that opens on the same line
 * (`return function() { return value; };`) has no line of its own in front of
 * it: the log goes before the statement holding that function, one scope out.
 * Undefined when leaving the function would change what the selection means:
 * the function binds the name as a parameter, or it is a non-arrow function
 * and the selection reads `this`.
 */
function outerStatementLine(
  ast: AcornNode,
  document: TextDocument,
  statement: AcornNode,
  name: string,
): number | undefined {
  let current = statement;
  for (;;) {
    const fn = innermostFunctionAround(ast, current);
    if (!fn || !canLeave(fn, name)) return undefined;
    const enclosing = findEnclosingStatement(ast, fn);
    if (!enclosing) return undefined;
    const { before } = statementLines(ast, document, enclosing.statement);
    if (before !== undefined) return before;
    current = enclosing.statement;
  }
}

function canLeave(fn: AcornNode, name: string): boolean {
  if (/^this\b/.test(name) && !isArrowFunctionExpression(fn)) return false;
  return !(parameterList(fn) ?? []).some((param) =>
    patternBindsName(param, name),
  );
}

function innermostFunctionAround(
  ast: AcornNode,
  node: AcornNode,
): AcornNode | undefined {
  let innermost: AcornNode | undefined;
  walk(ast, (candidate: AcornNode): boolean | void => {
    if (candidate.start > node.start || candidate.end < node.end) return true;
    if (candidate !== node && FUNCTION_TYPES.has(candidate.type)) {
      innermost = candidate;
    }
  });
  return innermost;
}
