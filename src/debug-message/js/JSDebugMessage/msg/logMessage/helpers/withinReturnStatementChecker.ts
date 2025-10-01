import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

/**
 * AST-based checker to determine if a variable is within a return statement context
 * @param document - The VS Code text document
 * @param selectionLine - The line where the variable is selected
 * @param variableName - The name of the selected variable
 * @returns Object indicating if the check passed
 */
export function withinReturnStatementChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const wanted = variableName.trim();
  if (!wanted) return { isChecked: false };

  const sourceCode = document.getText();

  if (!ast) {
    return { isChecked: false };
  }

  let isChecked = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Look for return statements
    if (node.type === 'ReturnStatement') {
      const returnStmt = node as { argument?: AcornNode };

      if (
        returnStmt.argument &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        const start = document.positionAt(node.start).line;
        const end = document.positionAt(node.end).line;

        // Check if the selection line is within the return statement
        if (selectionLine >= start && selectionLine <= end) {
          // Check if the return statement contains the target variable
          if (
            containsVariable(
              returnStmt.argument,
              wanted,
              sourceCode,
              document,
              selectionLine,
            )
          ) {
            isChecked = true;
            return true;
          }
        }
      }
    }
  });

  return { isChecked };
}

/**
 * Comprehensive helper function to check if a node contains the target variable reference
 * Handles both variable name matching and position-based matching for complex expressions
 */
function containsVariable(
  node: AcornNode,
  variableName: string,
  sourceCode: string,
  document: TextDocument,
  selectionLine: number,
  visited = new Set<AcornNode>(),
  depth = 0,
): boolean {
  if (!node) return false;

  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `containsVariable: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  if (visited.has(node)) {
    return false;
  }

  visited.add(node);

  // Special handling for arrow functions and function expressions
  // Check if the variable is a parameter of the function - if so, don't consider it external
  if (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  ) {
    const func = node as { params?: AcornNode[] };
    if (func.params) {
      // Check if variableName matches any parameter name
      for (const param of func.params) {
        if (isIdentifier(param) && param.name === variableName) {
          // This variable is a parameter of this function, not an external variable
          return false;
        }
      }
    }
  }

  // Position-based matching for complex expressions
  // This handles cases where the entire expression/object is selected
  if (node.start !== undefined && node.end !== undefined) {
    const start = document.positionAt(node.start).line;
    const end = document.positionAt(node.end).line;

    // If the selection line is within this node's range, it could be the target
    if (selectionLine >= start && selectionLine <= end) {
      // For complex expressions like object literals, array literals, etc.
      // we consider them a match if the selection is within their bounds
      if (
        node.type === 'ObjectExpression' ||
        node.type === 'ArrayExpression' ||
        node.type === 'CallExpression' ||
        node.type === 'BinaryExpression' ||
        node.type === 'ConditionalExpression' ||
        node.type === 'TemplateLiteral'
      ) {
        // Check if this node spans exactly the selection or if it's a reasonable match
        // We'll be permissive here since the user explicitly selected this content
        return true;
      }
    }
  }

  // Simple identifier: variableName
  if (isIdentifier(node)) {
    return node.name === variableName;
  }

  // Property access: object.property, person.name, etc.
  if (isMemberExpression(node)) {
    if (node.start !== undefined && node.end !== undefined) {
      const fullText = sourceCode.substring(node.start, node.end);
      if (fullText === variableName || fullText.includes(variableName)) {
        return true;
      }
    }
  }

  // Recursively check children
  let found = false;
  walk(node, (child: AcornNode) => {
    if (found) return true;
    if (
      child !== node &&
      containsVariable(
        child,
        variableName,
        sourceCode,
        document,
        selectionLine,
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
