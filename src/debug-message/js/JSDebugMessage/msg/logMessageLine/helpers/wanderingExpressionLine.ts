import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type EnclosingStatement,
  findEnclosingStatement,
  ifBodyFirstLine,
  isIdentifier,
  isInStatementHead,
  isMemberExpression,
  statementLines,
  walk,
} from '../../acorn-utils';

export function wanderingExpressionLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const code = document.getText();

  // Set up parent relationships
  function setParents(
    node: AcornNode,
    parent?: AcornNode,
    visited = new Set<AcornNode>(),
    depth = 0,
  ): void {
    // Safeguards against infinite recursion
    const MAX_DEPTH = 1000;

    if (depth >= MAX_DEPTH) {
      console.warn(
        `setParents: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
      );
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);

    if (parent) {
      (node as { parent?: AcornNode }).parent = parent;
    }

    for (const key in node) {
      if (
        key === 'type' ||
        key === 'start' ||
        key === 'end' ||
        key === 'loc' ||
        key === 'parent'
      ) {
        continue;
      }

      const value = (node as unknown as Record<string, unknown>)[key];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'type' in item) {
            setParents(item as AcornNode, node, visited, depth + 1);
          }
        }
      } else if (value && typeof value === 'object' && 'type' in value) {
        setParents(value as AcornNode, node, visited, depth + 1);
      }
    }
  }

  setParents(ast);

  let bestEndOffset = -1;
  let resultLine = -1;

  function isDeclaration(node: AcornNode): boolean {
    const parent = (node as { parent?: AcornNode }).parent;
    if (!parent) return false;

    // Check if this is the 'id' (name) part of a VariableDeclarator
    if (parent.type === 'VariableDeclarator') {
      const decl = parent as unknown as { id: AcornNode };
      return decl.id === node;
    }

    // Check if this is a function/method parameter name
    if (
      parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ArrowFunctionExpression' ||
      parent.type === 'MethodDefinition' ||
      parent.type === 'ClassMethod'
    ) {
      const func = parent as unknown as { params?: AcornNode[] };
      return func.params?.includes(node) ?? false;
    }

    // Check if this is the key part of a Property assignment
    if (parent.type === 'Property') {
      const prop = parent as unknown as { key: AcornNode };
      return prop.key === node;
    }

    return false;
  }

  function containsVariableName(node: AcornNode): boolean {
    // Direct identifier match
    if (
      isIdentifier(node) &&
      (node as { name: string }).name === variableName
    ) {
      return true;
    }

    // Property access expression that ends with variableName
    if (isMemberExpression(node)) {
      const nodeText = code.substring(node.start, node.end);
      return nodeText.endsWith(variableName);
    }

    return false;
  }

  walk(ast, (node: AcornNode): void => {
    const startLine = document.positionAt(node.start).line;
    const endLine = document.positionAt(node.end).line;

    const isInRange = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInRange) {
      return;
    }

    // If this node contains the variable and isn't a declaration
    if (containsVariableName(node) && !isDeclaration(node)) {
      const enclosing = findEnclosingStatement(ast, node);
      const top = enclosing?.statement ?? ast;

      if (bestEndOffset === -1 || top.end > bestEndOffset) {
        bestEndOffset = top.end;
        resultLine = enclosing
          ? statementLogLine(ast, document, enclosing, node)
          : multiLineAwareLine(
              document,
              top,
              document.positionAt(top.start).line,
            );
      }
    }
  });

  if (resultLine === -1) return selectionLine + 1;

  return resultLine;
}

/**
 * Where a wandering expression is logged relative to its enclosing statement:
 * - in a statement head (if/loop condition, switch discriminant): before the
 *   statement; for an else-if, the top of its body
 * - in a return or throw: before it, nothing after them runs
 * - in `import x = require()`: after it, the binding does not exist before
 * - otherwise before a multi-line statement, after a single-line one
 * "Before" climbs out of labels, braceless bodies and same-line `case`/`{`
 * headers; when no line before is safe, the log goes after (statementLines).
 */
function statementLogLine(
  ast: AcornNode,
  document: TextDocument,
  { statement, isElseIf }: EnclosingStatement,
  node: AcornNode,
): number {
  const { before, after } = statementLines(ast, document, statement);
  const beforeLine = before ?? after;

  if (isInStatementHead(statement, node)) {
    const elseIfBodyLine = isElseIf ? ifBodyFirstLine(statement) : undefined;
    return elseIfBodyLine ?? beforeLine;
  }

  switch (statement.type) {
    case 'ReturnStatement':
    case 'ThrowStatement':
      return beforeLine;
    case 'TSImportEqualsDeclaration':
      return document.positionAt(statement.end).line + 1;
  }

  return multiLineAwareLine(document, statement, beforeLine, after);
}

/** v3.18.0 rule: before a multi-line node, after a single-line one. */
function multiLineAwareLine(
  document: TextDocument,
  node: AcornNode,
  beforeLine: number,
  afterLine = document.positionAt(node.end).line + 1,
): number {
  const startLine = document.positionAt(node.start).line;
  const endLine = document.positionAt(node.end).line;
  return startLine < endLine ? beforeLine : afterLine;
}
