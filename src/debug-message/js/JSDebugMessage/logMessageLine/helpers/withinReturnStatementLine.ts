import ts from 'typescript';
import { TextDocument } from 'vscode';

/**
 * Comprehensive helper function to check if a node contains the target variable reference
 * Handles both variable name matching and position-based matching for complex expressions
 */
function containsVariable(
  node: ts.Node,
  variableName: string,
  document?: TextDocument,
  selectionLine?: number,
): boolean {
  if (!node) return false;

  // If we have document and selectionLine, also check for position-based matching
  // This handles cases where the entire expression/object is selected
  if (document && selectionLine !== undefined) {
    const start = document.positionAt(node.getStart()).line;
    const end = document.positionAt(node.getEnd()).line;

    // If the selection line is within this node's range, it could be the target
    if (selectionLine >= start && selectionLine <= end) {
      // For complex expressions like object literals, array literals, etc.
      // we consider them a match if the selection is within their bounds
      if (
        ts.isObjectLiteralExpression(node) ||
        ts.isArrayLiteralExpression(node) ||
        ts.isCallExpression(node) ||
        ts.isBinaryExpression(node) ||
        ts.isConditionalExpression(node) ||
        ts.isTemplateExpression(node)
      ) {
        // Check if this node spans exactly the selection or if it's a reasonable match
        // We'll be permissive here since the user explicitly selected this content
        return true;
      }
    }
  }

  // 1. Simple identifier: variableName
  if (ts.isIdentifier(node)) {
    return node.text === variableName;
  }

  // 2. Property access: object.property, person.name, etc.
  if (ts.isPropertyAccessExpression(node)) {
    const fullPath = getPropertyAccessPath(node);
    return (
      fullPath === variableName ||
      containsVariable(node.expression, variableName, document, selectionLine)
    );
  }

  // 3. Element access: object['key'], array[index], etc.
  if (ts.isElementAccessExpression(node)) {
    return (
      containsVariable(
        node.expression,
        variableName,
        document,
        selectionLine,
      ) ||
      containsVariable(
        node.argumentExpression,
        variableName,
        document,
        selectionLine,
      )
    );
  }

  // 4. Call expressions: func(), object.method(), etc.
  if (ts.isCallExpression(node)) {
    if (
      containsVariable(node.expression, variableName, document, selectionLine)
    )
      return true;
    return node.arguments.some((arg) =>
      containsVariable(arg, variableName, document, selectionLine),
    );
  }

  // 5. Binary expressions: a + b, x === y, etc.
  if (ts.isBinaryExpression(node)) {
    return (
      containsVariable(node.left, variableName, document, selectionLine) ||
      containsVariable(node.right, variableName, document, selectionLine)
    );
  }

  // 6. Prefix/Postfix unary expressions: !flag, ++counter, typeof x, etc.
  if (ts.isPrefixUnaryExpression(node)) {
    return containsVariable(
      node.operand,
      variableName,
      document,
      selectionLine,
    );
  }
  if (ts.isPostfixUnaryExpression(node)) {
    return containsVariable(
      node.operand,
      variableName,
      document,
      selectionLine,
    );
  }

  // 7. Conditional (ternary) expressions: condition ? a : b
  if (ts.isConditionalExpression(node)) {
    return (
      containsVariable(node.condition, variableName, document, selectionLine) ||
      containsVariable(node.whenTrue, variableName, document, selectionLine) ||
      containsVariable(node.whenFalse, variableName, document, selectionLine)
    );
  }

  // 8. Array literals: [a, b, c]
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.some((element) =>
      containsVariable(element, variableName, document, selectionLine),
    );
  }

  // 9. Object literals: { key: value }
  if (ts.isObjectLiteralExpression(node)) {
    return node.properties.some((prop) => {
      if (ts.isPropertyAssignment(prop)) {
        return (
          containsVariable(prop.name, variableName, document, selectionLine) ||
          containsVariable(
            prop.initializer,
            variableName,
            document,
            selectionLine,
          )
        );
      }
      if (ts.isShorthandPropertyAssignment(prop)) {
        return containsVariable(
          prop.name,
          variableName,
          document,
          selectionLine,
        );
      }
      if (ts.isSpreadAssignment(prop)) {
        return containsVariable(
          prop.expression,
          variableName,
          document,
          selectionLine,
        );
      }
      return false;
    });
  }

  // 10. Template literals: `Hello ${name}`
  if (ts.isTemplateExpression(node)) {
    return node.templateSpans.some((span) =>
      containsVariable(span.expression, variableName, document, selectionLine),
    );
  }

  // 11. Parenthesized expressions: (expression)
  if (ts.isParenthesizedExpression(node)) {
    return containsVariable(
      node.expression,
      variableName,
      document,
      selectionLine,
    );
  }

  // 12. Type assertions: expr as Type, <Type>expr
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
    return containsVariable(
      node.expression,
      variableName,
      document,
      selectionLine,
    );
  }

  // 13. Spread elements: ...array
  if (ts.isSpreadElement(node)) {
    return containsVariable(
      node.expression,
      variableName,
      document,
      selectionLine,
    );
  }

  // 14. Await expressions: await promise
  if (ts.isAwaitExpression(node)) {
    return containsVariable(
      node.expression,
      variableName,
      document,
      selectionLine,
    );
  }

  // 15. Arrow functions: (param) => expr
  if (ts.isArrowFunction(node)) {
    // Check if variable is used in the function body (but not as a parameter)
    const paramNames = node.parameters.map((p) =>
      ts.isIdentifier(p.name) ? p.name.text : '',
    );
    if (paramNames.includes(variableName)) return false; // It's a parameter, not external variable

    return containsVariable(node.body, variableName, document, selectionLine);
  }

  // 16. Function expressions: function() { ... }
  if (ts.isFunctionExpression(node)) {
    const paramNames = node.parameters.map((p) =>
      ts.isIdentifier(p.name) ? p.name.text : '',
    );
    if (paramNames.includes(variableName)) return false;

    return containsVariable(node.body, variableName, document, selectionLine);
  }

  // 17. Block statements: { ... }
  if (ts.isBlock(node)) {
    return node.statements.some((stmt) =>
      containsVariable(stmt, variableName, document, selectionLine),
    );
  }

  // 18. Expression statements
  if (ts.isExpressionStatement(node)) {
    return containsVariable(
      node.expression,
      variableName,
      document,
      selectionLine,
    );
  }

  // 19. Recursively check all child nodes for any other cases
  let found = false;
  ts.forEachChild(node, (child) => {
    if (
      !found &&
      containsVariable(child, variableName, document, selectionLine)
    ) {
      found = true;
    }
  });

  return found;
}

/**
 * Helper function to get the full property access path
 * e.g., person.profile.name -> "person.profile.name"
 */
function getPropertyAccessPath(node: ts.PropertyAccessExpression): string {
  const parts: string[] = [];

  let current: ts.Node = node;
  while (ts.isPropertyAccessExpression(current)) {
    parts.unshift(current.name.text);
    current = current.expression;
  }

  if (ts.isIdentifier(current)) {
    parts.unshift(current.text);
  }

  return parts.join('.');
}

/**
 * AST-driven helper to determine the line where to place the log message for a variable within a return statement
 * @param document - The VS Code text document
 * @param selectionLine - The line where the variable is selected
 * @param selectedVar - The selected variable name
 * @returns The line number where the log message should be placed
 */
export function withinReturnStatementLine(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  const wanted = selectedVar.trim();
  if (!wanted) return selectionLine + 1;

  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );

  let returnStatementLine = -1;

  ts.forEachChild(sourceFile, function visit(node): void {
    if (returnStatementLine !== -1) return;

    // Look for return statements
    if (ts.isReturnStatement(node)) {
      const start = document.positionAt(node.getStart()).line;
      const end = document.positionAt(node.getEnd()).line;

      // Check if the selection line is within the return statement
      if (selectionLine >= start && selectionLine <= end) {
        // Check if the return statement contains the target variable
        if (
          node.expression &&
          containsVariable(node.expression, wanted, document, selectionLine)
        ) {
          returnStatementLine = start;
          return;
        }
      }
    }

    // Continue traversing child nodes
    ts.forEachChild(node, visit);
  });

  // Return the line before the return statement, or fallback to next line
  return returnStatementLine !== -1 ? returnStatementLine : selectionLine + 1;
}
