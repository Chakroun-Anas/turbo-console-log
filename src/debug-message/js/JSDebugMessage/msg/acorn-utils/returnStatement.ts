import type { TextDocument } from 'vscode';
import type {
  AcornNode,
  ArrowFunctionExpression,
  ClassMethod,
  FunctionDeclaration,
  FunctionExpression,
  ReturnStatement,
} from './types';
import {
  isArrowFunctionExpression,
  isClassMethod,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isReturnStatement,
} from './guards';
import { parameterList, patternBindsName } from './bindings';
import { walk } from './walk';

type FunctionNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression
  | ClassMethod;

type Selection = {
  document: TextDocument;
  line: number;
  name: string;
  code: string;
};

// Composite expressions a selection is matched against by position alone:
// the selection may be the whole literal/call rather than a name inside it.
const POSITION_MATCH_TYPES = new Set([
  'ObjectExpression',
  'ArrayExpression',
  'CallExpression',
  'BinaryExpression',
  'ConditionalExpression',
  'TemplateLiteral',
]);

/**
 * The return statement a selection belongs to, if any.
 *
 * The selection line is owned by the innermost function whose body has lines
 * strictly around it (a callback or closure spanning several lines). Only
 * returns of that function, or of functions nested on the same line, qualify:
 * a return that merely wraps the owning callback (`return items.map((item) =>
 * {…})`, a returned JSX tree, a returned closure) is not where its body runs.
 * Among the qualifying returns covering the line, the innermost one whose
 * argument references the selection wins.
 */
export function findSelectionReturnStatement(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): ReturnStatement | undefined {
  const name = variableName.trim();
  if (!ast || !name) return undefined;

  const selection: Selection = {
    document,
    line: selectionLine,
    name,
    code: document.getText(),
  };
  const functions: FunctionNode[] = [];
  const returns: ReturnStatement[] = [];

  walk(ast, (node: AcornNode): boolean | void => {
    // Neither a function nor a return that misses the line can matter
    if (!coversLine(node, selection)) return true;
    if (isFunctionNode(node)) functions.push(node);
    if (isReturnStatement(node) && node.argument) returns.push(node);
  });

  const owner = innermost(
    functions.filter((fn) => bodyStrictlyAroundLine(fn, selection)),
  );

  return returns
    .filter((returnStatement) => {
      const scope = innermost(
        functions.filter((fn) => contains(fn, returnStatement)),
      );
      if (!owner) return true;
      return scope !== undefined && contains(owner, scope);
    })
    .sort((a, b) => a.end - a.start - (b.end - b.start))
    .find((returnStatement) =>
      referencesSelection(returnStatement.argument!, selection),
    );
}

function referencesSelection(argument: AcornNode, selection: Selection) {
  let found = false;
  walk(argument, (node: AcornNode): boolean | void => {
    if (found) return true;
    // A function whose own parameter is the name: not the selected value
    if (bindsParameter(node, selection.name)) return true;
    if (
      (POSITION_MATCH_TYPES.has(node.type) && coversLine(node, selection)) ||
      (isIdentifier(node) && node.name === selection.name) ||
      (isMemberExpression(node) &&
        selection.code.slice(node.start, node.end).includes(selection.name))
    ) {
      found = true;
      return true;
    }
  });
  return found;
}

function bindsParameter(node: AcornNode, name: string): boolean {
  if (!isFunctionNode(node)) return false;
  return (parameterList(node) ?? []).some((param) =>
    patternBindsName(param, name),
  );
}

function isFunctionNode(node: AcornNode): node is FunctionNode {
  return (
    isFunctionDeclaration(node) ||
    isFunctionExpression(node) ||
    isArrowFunctionExpression(node) ||
    isClassMethod(node)
  );
}

function bodyStrictlyAroundLine(fn: FunctionNode, selection: Selection) {
  const { document, line } = selection;
  return (
    document.positionAt(fn.body.start).line < line &&
    line < document.positionAt(fn.body.end).line
  );
}

function coversLine(node: AcornNode, { document, line }: Selection): boolean {
  return (
    document.positionAt(node.start).line <= line &&
    line <= document.positionAt(node.end).line
  );
}

function contains(outer: AcornNode, inner: AcornNode): boolean {
  return outer.start <= inner.start && inner.end <= outer.end;
}

function innermost<T extends AcornNode>(nodes: T[]): T | undefined {
  return nodes.reduce<T | undefined>(
    (best, node) => (!best || contains(best, node) ? node : best),
    undefined,
  );
}
