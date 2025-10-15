import { TextDocument, Position } from 'vscode';
import {
  type AcornNode,
  type FunctionDeclaration,
  type FunctionExpression,
  type ArrowFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isArrowFunctionExpression,
  walk,
} from '../../acorn-utils';

export function wanderingExpressionChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
): { isChecked: boolean } {
  // Hard search: get all positions of selectedText on the line
  const lineText = document.lineAt(selectionLine).text;
  const trimmedText = selectedText.trim();

  const potentialMatches: { start: number; end: number }[] = [];
  let index = lineText.indexOf(trimmedText);
  while (index !== -1) {
    const start = document.offsetAt(new Position(selectionLine, index));
    const end = start + trimmedText.length;
    potentialMatches.push({ start, end });
    index = lineText.indexOf(trimmedText, index + 1);
  }

  const sourceCode = document.getText();

  if (!ast) {
    return { isChecked: false };
  }

  // Build a parent map for checking parent nodes
  const parentMap = new Map<AcornNode, AcornNode>();

  walk(ast, (node: AcornNode) => {
    // Store parent references for common structures
    if (node.type === 'VariableDeclarator') {
      const declarator = node as { id?: AcornNode; init?: AcornNode };
      if (declarator.id) parentMap.set(declarator.id, node);
      if (declarator.init) parentMap.set(declarator.init, node);
    } else if (node.type === 'Property') {
      const prop = node as { key?: AcornNode; value?: AcornNode };
      if (prop.key) parentMap.set(prop.key, node);
      if (prop.value) parentMap.set(prop.value, node);
    } else if (node.type === 'MemberExpression') {
      const member = node as { object?: AcornNode; property?: AcornNode };
      if (member.object) parentMap.set(member.object, node);
      if (member.property) parentMap.set(member.property, node);
    } else if (node.type === 'CallExpression') {
      const call = node as { callee?: AcornNode; arguments?: AcornNode[] };
      if (call.callee) parentMap.set(call.callee, node);
      if (call.arguments) {
        call.arguments.forEach((arg) => {
          if (arg) parentMap.set(arg, node);
        });
      }
    } else if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      const func = node as { params?: AcornNode[]; body?: AcornNode };
      if (func.params) {
        func.params.forEach((param) => {
          if (param) parentMap.set(param, node);
        });
      }
      if (func.body) parentMap.set(func.body, node);
    } else if (node.type === 'ReturnStatement') {
      const ret = node as { argument?: AcornNode | null };
      if (ret.argument) parentMap.set(ret.argument, node);
    } else if (node.type === 'ExpressionStatement') {
      const expr = node as { expression?: AcornNode };
      if (expr.expression) parentMap.set(expr.expression, node);
    } else if (node.type === 'ObjectExpression') {
      const obj = node as { properties?: AcornNode[] };
      if (obj.properties) {
        obj.properties.forEach((prop) => {
          if (prop) parentMap.set(prop, node);
        });
      }
    } else if (node.type === 'BlockStatement') {
      const block = node as { body?: AcornNode[] };
      if (block.body) {
        block.body.forEach((stmt) => {
          if (stmt) parentMap.set(stmt, node);
        });
      }
    }
  });

  function getNodeText(node: AcornNode): string {
    if (node.start !== undefined && node.end !== undefined) {
      return sourceCode.substring(node.start, node.end).trim();
    }
    return '';
  }

  function isWandering(node: AcornNode): boolean {
    const parent = parentMap.get(node);

    if (!parent) {
      return true; // No parent info, assume wandering
    }

    // Exclude if selected node is a declaration name
    if (parent.type === 'VariableDeclarator') {
      const declarator = parent as { id?: AcornNode };
      if (declarator.id === node) {
        return false;
      }
    }

    // Exclude if it's a property assignment key
    if (parent.type === 'Property') {
      const prop = parent as { key?: AcornNode };
      if (prop.key === node) {
        return false;
      }
    }

    // Exclude if parent is object literal
    if (isObjectExpression(parent)) {
      return false;
    }

    // Exclude function parameters (referenced usage)
    let current: AcornNode | undefined = parent;
    const visited = new Set<AcornNode>();
    let depth = 0;
    const MAX_DEPTH = 1000;

    while (current) {
      // Safeguards against infinite loops
      if (depth >= MAX_DEPTH) {
        console.warn(
          `isWandering: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
        );
        break;
      }
      if (visited.has(current)) {
        break;
      }
      visited.add(current);
      depth++;

      if (
        isFunctionDeclaration(current) ||
        isFunctionExpression(current) ||
        isArrowFunctionExpression(current)
      ) {
        const func = current as
          | FunctionDeclaration
          | FunctionExpression
          | ArrowFunctionExpression;
        const paramNames = func.params
          .map((p) => (isIdentifier(p) ? p.name : null))
          .filter(Boolean) as string[];

        if (isIdentifier(node) && paramNames.includes(node.name)) {
          return false;
        }
        break;
      }
      current = parentMap.get(current);
    }

    return true;
  }

  let matched = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (matched) return true;

    if (node.start === undefined || node.end === undefined) {
      return;
    }

    const nodeText = getNodeText(node);

    const isPotential =
      nodeText === trimmedText &&
      potentialMatches.some(
        (m) => m.start === node.start && m.end === node.end,
      );

    if (
      isPotential &&
      (isIdentifier(node) || isMemberExpression(node)) &&
      isWandering(node)
    ) {
      matched = true;
      return true;
    }
  });

  return { isChecked: matched };
}
