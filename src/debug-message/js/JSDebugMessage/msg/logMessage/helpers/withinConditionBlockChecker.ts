import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

export function withinConditionBlockChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const wanted = variableName.trim();

  const sourceCode = document.getText();

  if (!ast) {
    return { isChecked: false };
  }

  let isChecked = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Only handle if statement conditions
    if (node.type === 'IfStatement') {
      const ifStmt = node as { test?: AcornNode };
      const condition = ifStmt.test;

      if (!condition) return;

      if (condition.start !== undefined && condition.end !== undefined) {
        const conditionStart = document.positionAt(condition.start).line;
        const conditionEnd = document.positionAt(condition.end).line;

        // Check if selection is within the condition
        if (selectionLine >= conditionStart && selectionLine <= conditionEnd) {
          // Check if the wanted variable appears as a property access in the condition
          if (containsPropertyAccess(condition, wanted, sourceCode)) {
            isChecked = true;
            return true;
          }
        }
      }
    }
  });

  return { isChecked };
}

function containsPropertyAccess(
  node: AcornNode,
  variableName: string,
  sourceCode: string,
  visited = new Set<AcornNode>(),
  depth = 0,
): boolean {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `containsPropertyAccess: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  if (visited.has(node)) {
    return false;
  }

  visited.add(node);

  // Check if this node is a member expression that includes our variable
  if (isMemberExpression(node)) {
    if (node.start !== undefined && node.end !== undefined) {
      const fullText = sourceCode.substring(node.start, node.end);
      if (fullText.includes(variableName)) {
        return true;
      }
    }
  }

  // Check if this node is an identifier that matches our variable
  if (isIdentifier(node) && node.name === variableName) {
    return true;
  }

  // Recursively check children
  let found = false;
  walk(node, (child: AcornNode) => {
    if (found) return true;
    if (
      child !== node &&
      containsPropertyAccess(
        child,
        variableName,
        sourceCode,
        visited,
        depth + 1,
      )
    ) {
      found = true;
      return true;
    }
  });

  return found;
}
