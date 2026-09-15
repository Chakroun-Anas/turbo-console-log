import type { TextDocument } from 'vscode';
import type { AcornNode } from './types';
import { STATEMENT_TYPES } from './guards';
import { walk } from './walk';

type IfStatementNode = AcornNode & {
  test: AcornNode;
  consequent: AcornNode;
  alternate: AcornNode | null;
};

type LoopHeadNode = AcornNode & {
  discriminant?: AcornNode;
  test?: AcornNode | null;
  init?: AcornNode | null;
  update?: AcornNode | null;
  left?: AcornNode;
  right?: AcornNode;
};

export type EnclosingStatement = {
  statement: AcornNode;
  /** The statement is the `if` of an `else if` branch. */
  isElseIf: boolean;
};

function contains(outer: AcornNode, inner: AcornNode): boolean {
  return outer.start <= inner.start && inner.end <= outer.end;
}

/**
 * The innermost statement (see `STATEMENT_TYPES`) whose range contains `node`.
 */
export function findEnclosingStatement(
  ast: AcornNode,
  node: AcornNode,
): EnclosingStatement | undefined {
  let innermost: AcornNode | undefined;
  const elseIfs = new Set<AcornNode>();

  walk(ast, (candidate: AcornNode): boolean | void => {
    if (!contains(candidate, node)) return true; // Nothing below can contain it
    if (candidate.type === 'IfStatement') {
      const { alternate } = candidate as IfStatementNode;
      if (alternate?.type === 'IfStatement') elseIfs.add(alternate);
    }
    if (STATEMENT_TYPES.has(candidate.type)) innermost = candidate;
  });

  return innermost
    ? { statement: innermost, isElseIf: elseIfs.has(innermost) }
    : undefined;
}

/**
 * The expressions a compound statement evaluates before (or to decide on)
 * running its body: an if/while/do-while test, a for loop's init/test/update,
 * a for-in/for-of head, a switch discriminant. Undefined for statements
 * without a body.
 */
export function statementHeads(statement: AcornNode): AcornNode[] | undefined {
  const head = statement as LoopHeadNode;
  switch (statement.type) {
    case 'IfStatement':
    case 'WhileStatement':
    case 'DoWhileStatement':
      return head.test ? [head.test] : [];
    case 'ForStatement':
      return [head.init, head.test, head.update].filter(
        (part): part is AcornNode => Boolean(part),
      );
    case 'ForInStatement':
    case 'ForOfStatement':
      return [head.left, head.right].filter((part): part is AcornNode =>
        Boolean(part),
      );
    case 'SwitchStatement':
      return head.discriminant ? [head.discriminant] : [];
    default:
      return undefined;
  }
}

/** Whether `node` sits in one of the statement's head expressions. */
export function isInStatementHead(
  statement: AcornNode,
  node: AcornNode,
): boolean {
  return (statementHeads(statement) ?? []).some((head) => contains(head, node));
}

/** The body block of an `if` statement, when it is a `{ … }` block. */
export function ifConsequentBlock(statement: AcornNode): AcornNode | undefined {
  const { consequent } = statement as IfStatementNode;
  return consequent?.type === 'BlockStatement' ? consequent : undefined;
}

/**
 * Zero-based first line inside the `{ … }` body of an `if` (the top of an
 * else-if body, for the else-if decision). Undefined for a braceless body or
 * a block that opens and closes on the same line.
 */
export function ifBodyFirstLine(statement: AcornNode): number | undefined {
  const block = ifConsequentBlock(statement);
  if (!block?.loc) return undefined;
  const blockStartLine = block.loc.start.line - 1; // Acorn lines are 1-based
  const blockEndLine = block.loc.end.line - 1;
  return blockStartLine < blockEndLine ? blockStartLine + 1 : undefined;
}

export type StatementLines = {
  /**
   * Zero-based line a log inserted BEFORE the statement goes on (see
   * `statementAnchorStart`). Undefined when no whole line in front of it is
   * safe, e.g. a function or catch body that opens on the statement's line.
   */
  before: number | undefined;
  /**
   * Zero-based line right after the statement, climbed out of braceless
   * bodies and labels first: after `if (a) x(); else\n  y();` is after `y();`,
   * not the else body.
   */
  after: number;
};

/** Where a log goes before or after `statement` (see `StatementLines`). */
export function statementLines(
  ast: AcornNode,
  document: TextDocument,
  statement: AcornNode,
): StatementLines {
  const chain = ancestorChain(ast, statement);
  const outer = chain[climbWrappers(chain, chain.length - 1, false)];
  const before = statementAnchorStart(ast, statement, document.getText());
  return {
    before: before === undefined ? undefined : document.positionAt(before).line,
    after: document.positionAt(outer.end).line + 1,
  };
}

/**
 * Offset a log inserted BEFORE `statement` has to start at, climbing out of
 * the places that cannot take a statement in front of it:
 * - labels (`search:\n for (…)`): a log between them breaks `break search`
 * - braceless bodies (`if (!user) throw …`, `else\n throw …`, `while (…) x()`)
 *   and for-loop heads: the log would become the body and push the statement
 *   out of it
 * - `export` keywords and the decorators of an exported class
 * - a line shared with a token of the parent: `case 'x': throw …` climbs to
 *   the `switch`, `if (a) { throw … }` to the `if`; the insertion line must
 *   hold nothing but whitespace, comments and whole sibling statements
 * Undefined when that would leave the scope the statement runs in (a function
 * or catch body that opens on the same line), or when a sibling statement
 * ends on the anchor line.
 */
export function statementAnchorStart(
  ast: AcornNode,
  statement: AcornNode,
  code: string,
): number | undefined {
  const chain = ancestorChain(ast, statement);
  let index = chain.length - 1;

  for (;;) {
    index = climbWrappers(chain, index, true);
    const anchor = chain[index];
    const container = chain[index - 1];
    const siblings = container && statementList(container);
    if (!anchor || !siblings) return undefined;

    const start = anchorStart(anchor);
    if (isLineFreeBefore(code, start, siblings)) return start;

    // The anchor line holds a token of the container: climb past it
    if (container.type === 'SwitchCase') {
      index -= 2; // SwitchCase -> SwitchStatement
      continue;
    }
    if (container.type !== 'BlockStatement') return undefined;
    const owner = chain[index - 2];
    if (!owner) return undefined;
    if (statementList(owner)) {
      index -= 1; // A bare `{ … }` block is itself a statement
    } else if (BLOCK_OWNER_STATEMENTS.has(owner.type)) {
      index -= 2;
    } else {
      return undefined; // Function, catch clause, static block, …
    }
  }
}

/** Statements whose body or clauses are `{ … }` blocks in the same scope. */
const BLOCK_OWNER_STATEMENTS = new Set([
  'IfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'LabeledStatement',
  'TryStatement',
  'WithStatement',
]);

/**
 * Every node whose range contains `statement`, outermost first, ending with
 * `statement` itself.
 */
function ancestorChain(ast: AcornNode, statement: AcornNode): AcornNode[] {
  const chain: AcornNode[] = [];
  walk(ast, (candidate: AcornNode): boolean | void => {
    if (!contains(candidate, statement)) return true;
    chain.push(candidate);
    if (candidate === statement) return true;
  });
  return chain[chain.length - 1] === statement ? chain : [statement];
}

/**
 * Climbs from `chain[index]` out of braceless bodies, labels, export wrappers
 * and, with `climbHeads`, declarations in a for-loop head; returns the index
 * of the outermost node reached.
 */
function climbWrappers(
  chain: AcornNode[],
  index: number,
  climbHeads: boolean,
): number {
  while (index > 0 && isWrappedBy(chain[index - 1], chain[index], climbHeads)) {
    index--;
  }
  return index;
}

function isWrappedBy(
  parent: AcornNode,
  child: AcornNode,
  climbHeads: boolean,
): boolean {
  const { consequent, alternate, body } = parent as AcornNode & {
    consequent?: AcornNode;
    alternate?: AcornNode | null;
    body?: AcornNode;
  };
  switch (parent.type) {
    case 'ExportNamedDeclaration':
    case 'ExportDefaultDeclaration':
    case 'LabeledStatement':
      return true;
    case 'IfStatement':
    case 'WhileStatement':
    case 'DoWhileStatement':
    case 'ForStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'WithStatement':
      if (child.type === 'BlockStatement' || !STATEMENT_LIKE.has(child.type)) {
        return false;
      }
      // A braceless body, or a declaration in a for head (`for (let i = 0; …`)
      return (
        child === consequent ||
        child === alternate ||
        child === body ||
        climbHeads
      );
    default:
      return false;
  }
}

const STATEMENT_LIKE = new Set([
  ...STATEMENT_TYPES,
  'EmptyStatement',
  'BreakStatement',
  'ContinueStatement',
  'DebuggerStatement',
  'TryStatement',
  'WithStatement',
  'FunctionDeclaration',
  'ClassDeclaration',
  'ExportNamedDeclaration',
]);

/** The statement list a node holds, when it is a statement container. */
function statementList(node: AcornNode): AcornNode[] | undefined {
  const { body, consequent } = node as AcornNode & {
    body?: unknown;
    consequent?: unknown;
  };
  switch (node.type) {
    case 'Program':
    case 'BlockStatement':
    case 'StaticBlock':
    case 'TSModuleBlock':
      return Array.isArray(body) ? (body as AcornNode[]) : undefined;
    case 'SwitchCase':
      return Array.isArray(consequent)
        ? (consequent as AcornNode[])
        : undefined;
    default:
      return undefined;
  }
}

/** Start of a statement including decorators placed before an `export`. */
function anchorStart(anchor: AcornNode): number {
  type Decorated = AcornNode & {
    declaration?: Decorated | null;
    decorators?: AcornNode[];
  };
  const { declaration, decorators } = anchor as Decorated;
  const starts = [
    anchor.start,
    declaration?.start,
    ...(decorators ?? []).map((decorator) => decorator.start),
    ...(declaration?.decorators ?? []).map((decorator) => decorator.start),
  ].filter((start): start is number => typeof start === 'number');
  return Math.min(...starts);
}

/**
 * Whether the line `start` sits on holds, before `start`, nothing but
 * whitespace, block comments and whole statements of `siblings`: a line
 * inserted in front of it then lands in the same statement list.
 */
function isLineFreeBefore(
  code: string,
  start: number,
  siblings: AcornNode[],
): boolean {
  const lineStart = code.lastIndexOf('\n', start - 1) + 1;
  let cursor = lineStart;
  for (const sibling of siblings) {
    if (sibling.start >= start) break;
    if (sibling.end <= lineStart) continue;
    if (sibling.start < lineStart) return false; // Ends on the anchor line
    if (!isBlank(code.slice(cursor, sibling.start))) return false;
    cursor = sibling.end;
  }
  return isBlank(code.slice(cursor, start));
}

function isBlank(text: string): boolean {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').trim() === '';
}
