import type { SyntaxNode } from '@lezer/common';
import type { PythonProgram } from './types';

/** Convert a 0-based line number to its character offset in the source. */
export function lineToOffset(program: PythonProgram, line: number): number {
  return program.lineOffsets[Math.min(line, program.lineOffsets.length - 1)];
}

/** Convert a character offset to a 0-based line number. */
export function offsetToLine(program: PythonProgram, offset: number): number {
  let lo = 0;
  let hi = program.lineOffsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (program.lineOffsets[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Resolve the innermost node that covers the given 0-based line.
 *
 * Resolves from the first non-whitespace character of the line rather than
 * column 0. Column 0 of an indented line (e.g. a class method's `def`) lands in
 * the leading indentation, which belongs to the enclosing container's body and
 * sits *before* the statement node starts — so `tree.resolve` would return the
 * outer container and ancestor walks would miss the real statement (e.g. drop a
 * method's name from the enclosing context). Mirrors `findStatementAtLine`.
 */
export function resolveNodeAtLine(
  program: PythonProgram,
  line: number,
): SyntaxNode {
  const rawOffset = lineToOffset(program, line);
  const lineText = program.lines[line] ?? '';
  const firstNonWS = lineText.search(/\S/);
  const offset = firstNonWS >= 0 ? rawOffset + firstNonWS : rawOffset;
  return program.tree.resolve(offset, 1);
}

/**
 * Walk up from `node` until the predicate matches, or return null.
 */
export function findAncestor(
  node: SyntaxNode,
  predicate: (n: SyntaxNode) => boolean,
): SyntaxNode | null {
  let current: SyntaxNode | null = node;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return null;
}

/**
 * Find the first child of `node` with the given type name.
 */
export function findChild(
  node: SyntaxNode,
  typeName: string,
): SyntaxNode | null {
  let child = node.firstChild;
  while (child) {
    if (child.type.name === typeName) return child;
    child = child.nextSibling;
  }
  return null;
}

/**
 * Collect all children of `node` with the given type name.
 */
export function findChildren(
  node: SyntaxNode,
  typeName: string,
): SyntaxNode[] {
  const results: SyntaxNode[] = [];
  let child = node.firstChild;
  while (child) {
    if (child.type.name === typeName) results.push(child);
    child = child.nextSibling;
  }
  return results;
}

/**
 * Return the 0-based line number immediately after the statement that
 * contains selectionLine ends. Used by all assignment-type line resolvers.
 */
export function afterStatementEndLine(
  program: PythonProgram,
  selectionLine: number,
): number {
  const stmt = findStatementAtLine(program, selectionLine);
  return stmt ? offsetToLine(program, stmt.to - 1) + 1 : selectionLine + 1;
}

/** First non-`:` child of a suite (Body / MatchBody), or null. */
function firstSuiteStatement(suite: SyntaxNode): SyntaxNode | null {
  let child = suite.firstChild;
  while (child) {
    if (child.type.name !== ':') return child;
    child = child.nextSibling;
  }
  return null;
}

/**
 * Within `root`, find the suite node whose leading `:` token sits on `line` —
 * i.e. the body of a clause whose header (`with … as x:`, `except … as e:`,
 * `case …:`) is on that line. Pre-order, returns the first match.
 */
function findSuiteWithColonOnLine(
  program: PythonProgram,
  root: SyntaxNode,
  line: number,
): SyntaxNode | null {
  const first = root.firstChild;
  if (
    first &&
    first.type.name === ':' &&
    offsetToLine(program, first.from) === line
  ) {
    return root;
  }
  let child = root.firstChild;
  while (child) {
    const found = findSuiteWithColonOnLine(program, child, line);
    if (found) return found;
    child = child.nextSibling;
  }
  return null;
}

/**
 * Line resolver for the WanderingExpression fallback (statements matching no
 * specific checker). Beyond the plain "after the statement" default it handles:
 *  - `match` subject (selection on the `match` header line): the subject exists
 *    before evaluation, so log BEFORE the match — like an if/while condition.
 *  - a variable bound by a clause header on the selection line — `with … as`,
 *    `except … as`, a `case` pattern — log INSIDE that clause's suite, not after
 *    the whole statement (which would be out of scope / a NameError).
 */
export function wanderingExpressionLine(
  program: PythonProgram,
  selectionLine: number,
): number {
  const stmt = findStatementAtLine(program, selectionLine);
  if (!stmt) return selectionLine + 1;

  if (
    stmt.type.name === 'MatchStatement' &&
    offsetToLine(program, stmt.from) === selectionLine
  ) {
    return offsetToLine(program, stmt.from);
  }

  const suite = findSuiteWithColonOnLine(program, stmt, selectionLine);
  if (suite) {
    const target = firstSuiteStatement(suite);
    if (target) return offsetToLine(program, target.from);
  }

  return afterStatementEndLine(program, selectionLine);
}

/**
 * Return the 0-based line of the first real statement inside the given node's
 * `Body` (a `FunctionDefinition`, `ForStatement`, etc.), skipping the leading
 * `:` token that Lezer places as the Body's first child. Used to insert a log
 * at the top of a function/loop body. Falls back to the line after the node's
 * header when no body statement is found.
 */
export function firstBodyStatementLine(
  program: PythonProgram,
  stmt: SyntaxNode,
): number {
  const headerLine = offsetToLine(program, stmt.from);
  const body = findChild(stmt, 'Body');
  if (body) {
    let child = body.firstChild;
    while (child) {
      if (child.type.name !== ':') {
        const childLine = offsetToLine(program, child.from);
        // Single-line suite (e.g. `def f(x): return x`): the body sits on the
        // header line itself, so there is no separate line to insert into.
        // Fall back to after the statement rather than ABOVE the header (which
        // would reference a not-yet-in-scope name).
        if (childLine === headerLine) {
          return offsetToLine(program, stmt.to - 1) + 1;
        }
        return childLine;
      }
      child = child.nextSibling;
    }
  }
  return headerLine + 1;
}

/**
 * Returns true if the condition of an if/while statement contains a walrus
 * assignment (`:=`, a `NamedExpression`). Such a name is bound *during* condition
 * evaluation — like a loop variable — so a log referencing it must be inserted
 * inside the body, never before the statement (which would be a NameError). The
 * search is bounded to the condition (before the Body) so a walrus that appears
 * inside the body itself does not count.
 */
export function conditionContainsWalrus(stmt: SyntaxNode): boolean {
  const body = findChild(stmt, 'Body');
  const bound = body ? body.from : stmt.to;
  const search = (node: SyntaxNode): boolean => {
    let child = node.firstChild;
    while (child) {
      if (child.from >= bound) break;
      if (child.type.name === 'NamedExpression') return true;
      if (search(child)) return true;
      child = child.nextSibling;
    }
    return false;
  };
  return search(stmt);
}

/**
 * When decorators are present, Lezer nests the FunctionDefinition/ClassDefinition
 * inside a `DecoratedStatement` (children: Decorator…, FunctionDefinition). The
 * statement-level node is then the DecoratedStatement, which hides the def from
 * def/class-aware checks (e.g. function-parameter detection) and has no `Body`
 * child. Unwrap it so callers always see the underlying definition.
 */
function unwrapDecoratedStatement(node: SyntaxNode): SyntaxNode {
  if (node.type.name !== 'DecoratedStatement') return node;
  return (
    findChild(node, 'FunctionDefinition') ??
    findChild(node, 'ClassDefinition') ??
    node
  );
}

/**
 * Find the statement-level node (direct child of Script or Body) that
 * contains the given 0-based line.
 */
export function findStatementAtLine(
  program: PythonProgram,
  line: number,
): SyntaxNode | null {
  // Resolve from the first non-whitespace character to avoid landing inside
  // leading indentation, which would cause tree.resolve() to return an outer
  // container node (e.g. FunctionDefinition) instead of the inner statement.
  const rawOffset = lineToOffset(program, line);
  const lineText = program.lines[line] ?? '';
  const firstNonWS = lineText.search(/\S/);
  const offset = firstNonWS >= 0 ? rawOffset + firstNonWS : rawOffset;
  let node: SyntaxNode | null = program.tree.resolve(offset, 1);

  while (node) {
    const parentName = node.parent?.type.name;
    if (parentName === 'Script' || parentName === 'Body') {
      return unwrapDecoratedStatement(node);
    }
    node = node.parent;
  }
  return null;
}
