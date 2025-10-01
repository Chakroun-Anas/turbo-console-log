import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isMemberExpression,
  isConditionalExpression,
  walk,
} from '../../acorn-utils';

export function withinConditionBlockLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const code = document.getText();

  let targetLine = selectionLine + 1;

  walk(ast, (node: AcornNode): boolean | void => {
    let condition: AcornNode | undefined;
    let hasBlock = false;

    // Extract condition based on statement type
    if (node.type === 'IfStatement') {
      const ifNode = node as unknown as {
        test: AcornNode;
        consequent: AcornNode;
      };
      condition = ifNode.test;
      hasBlock = true;
    } else if (node.type === 'WhileStatement') {
      const whileNode = node as unknown as { test: AcornNode; body: AcornNode };
      condition = whileNode.test;
      hasBlock = true;
    } else if (node.type === 'ForStatement') {
      const forNode = node as unknown as { test?: AcornNode; body: AcornNode };
      condition = forNode.test;
      hasBlock = true;
    } else if (node.type === 'ForInStatement') {
      const forInNode = node as unknown as {
        right: AcornNode;
        body: AcornNode;
      };
      condition = forInNode.right;
      hasBlock = true;
    } else if (node.type === 'ForOfStatement') {
      const forOfNode = node as unknown as {
        right: AcornNode;
        body: AcornNode;
      };
      condition = forOfNode.right;
      hasBlock = true;
    }

    if (condition && hasBlock) {
      const conditionStart = document.positionAt(condition.start).line;
      const conditionEnd = document.positionAt(condition.end).line;

      // Check if selection is within the condition
      if (selectionLine >= conditionStart && selectionLine <= conditionEnd) {
        // Check if the wanted variable appears in the condition
        if (containsPropertyAccess(condition, variableName.trim(), code)) {
          // Always insert before the start of the statement
          const statementStart = document.positionAt(node.start).line;
          targetLine = statementStart;
          return true; // Stop early
        }
      }
    }

    // Handle conditional expressions (ternary operators)
    if (isConditionalExpression(node)) {
      const ternary = node as {
        test: AcornNode;
        consequent: AcornNode;
        alternate: AcornNode;
      };
      const conditionStart = document.positionAt(ternary.test.start).line;
      const conditionEnd = document.positionAt(ternary.test.end).line;

      if (selectionLine >= conditionStart && selectionLine <= conditionEnd) {
        if (containsPropertyAccess(ternary.test, variableName.trim(), code)) {
          // For ternary expressions, insert after the entire expression
          const expressionEnd = document.positionAt(node.end).line;
          targetLine = expressionEnd + 1;
          return true; // Stop early
        }
      }
    }
  });

  return targetLine;
}

function containsPropertyAccess(
  node: AcornNode,
  variableName: string,
  code: string,
): boolean {
  let found = false;

  walk(node, (n: AcornNode): boolean | void => {
    // Check if this node is a member expression that includes our variable
    if (isMemberExpression(n)) {
      const fullText = code.substring(n.start, n.end);
      if (fullText.includes(variableName)) {
        found = true;
        return true; // Stop early
      }
    }

    // Check if this node is an identifier that matches our variable
    if (isIdentifier(n) && (n as { name: string }).name === variableName) {
      found = true;
      return true; // Stop early
    }
  });

  return found;
}
