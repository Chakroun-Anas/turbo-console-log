import { Position, TextDocument } from 'vscode';
import {
  type AcornNode,
  type CallExpression,
  findEnclosingStatement,
  ifBodyFirstLine,
  isAssignmentExpression,
  isAwaitExpression,
  isCallExpression,
  isChainExpression,
  isExpressionStatement,
  isInStatementHead,
  isMemberExpression,
  isTransparentWrapper,
  isVariableDeclaration,
  statementHeads,
  statementLines,
  walk,
} from '../../acorn-utils';

export function propertyMethodCallLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
): number {
  const call = findMethodCall(ast, document, selectionLine, selectedText);
  if (!call) return selectionLine + 1;

  const afterCall = document.positionAt(call.end).line + 1;
  const enclosing = findEnclosingStatement(ast, call);
  if (!enclosing) return afterCall;

  const { statement, isElseIf } = enclosing;
  // Every "before" goes through statementLines: it climbs out of braceless
  // bodies (`if (!user)\n  throw …`), labels and same-line `case`/`else`
  // headers, where a log in front of the statement would become the body or
  // break the syntax. "After" climbs out of braceless bodies too.
  const { before, after } = statementLines(ast, document, statement);

  if (statementHeads(statement)) {
    if (!isInStatementHead(statement, call)) return afterCall;
    // Else-if decision: the top of the else-if body. Before the whole chain
    // is only a fallback for a braceless body, the condition may rely on
    // earlier branches (`if (!user) … else if (user.roles.includes(…))`).
    const bodyLine = isElseIf ? ifBodyFirstLine(statement) : undefined;
    return bodyLine ?? before ?? afterCall;
  }

  // Nothing after a throw runs. (A call inside a return is never a
  // PropertyMethodCall, the checker leaves it to WithinReturnStatement.)
  if (statement.type === 'ThrowStatement') return before ?? after;

  const startLine = document.positionAt(statement.start).line;
  const endLine = document.positionAt(statement.end).line;
  if (startLine === endLine) return after;
  // A multi-line statement that is the method call itself (`obj.method(…);`,
  // `const x = await obj.method(…);`) ends with the call: after it is safe.
  // When the call is only a piece of it (an argument, a chain link, a JSX
  // child) its end is mid-statement, so the log goes before the statement.
  return statementValue(statement) === call ? after : (before ?? after);
}

/**
 * The call `obj.method(…)` whose object is the selected text on the line.
 */
function findMethodCall(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
): CallExpression | undefined {
  const charIndex = document.lineAt(selectionLine).text.indexOf(selectedText);
  if (charIndex === -1) return undefined;

  const startOffset = document.offsetAt(new Position(selectionLine, charIndex));
  const endOffset = startOffset + selectedText.length;
  const code = document.getText();
  let found: CallExpression | undefined;

  walk(ast, (node: AcornNode): boolean | void => {
    if (found) return true;
    if (!isCallExpression(node) || !isMemberExpression(node.callee)) return;

    const { object } = node.callee;
    if (
      code.substring(object.start, object.end) === selectedText &&
      object.start <= startOffset &&
      object.end >= endOffset
    ) {
      found = node;
      return true;
    }
  });

  return found;
}

/**
 * The value a statement boils down to, through assignments and wrappers that
 * pass it on: `x = await (obj.method() as T)` yields the call.
 */
function statementValue(statement: AcornNode): AcornNode | undefined {
  if (isExpressionStatement(statement)) return unwrap(statement.expression);
  if (isVariableDeclaration(statement) && statement.declarations.length === 1) {
    const { init } = statement.declarations[0];
    return init ? unwrap(init) : undefined;
  }
  return undefined;
}

function unwrap(node: AcornNode): AcornNode {
  if (isAssignmentExpression(node)) return unwrap(node.right);
  if (isAwaitExpression(node)) return unwrap(node.argument);
  if (isChainExpression(node) || isTransparentWrapper(node)) {
    return unwrap(node.expression);
  }
  return node;
}
