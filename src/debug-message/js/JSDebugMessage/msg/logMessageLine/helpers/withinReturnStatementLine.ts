import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

/**
 * Comprehensive helper function to check if a node contains the target variable reference
 * Handles both variable name matching and position-based matching for complex expressions
 */
function containsVariable(
  node: AcornNode,
  variableName: string,
  code: string,
  document?: TextDocument,
  selectionLine?: number,
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

  // If we have document and selectionLine, also check for position-based matching
  // This handles cases where the entire expression/object is selected
  if (document && selectionLine !== undefined) {
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

  // 1. Simple identifier: variableName
  if (isIdentifier(node)) {
    return (node as unknown as { name: string }).name === variableName;
  }

  // 2. Property access: object.property, person.name, etc.
  if (isMemberExpression(node)) {
    const fullPath = getPropertyAccessPath(node);
    if (fullPath === variableName) return true;

    const memberNode = node as unknown as {
      object: AcornNode;
      property: AcornNode;
    };
    return containsVariable(
      memberNode.object,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 3. Element access: object['key'], array[index], etc.
  if (node.type === 'MemberExpression') {
    const memberNode = node as unknown as {
      object: AcornNode;
      property: AcornNode;
      computed: boolean;
    };
    if (memberNode.computed) {
      return (
        containsVariable(
          memberNode.object,
          variableName,
          code,
          document,
          selectionLine,
        ) ||
        containsVariable(
          memberNode.property,
          variableName,
          code,
          document,
          selectionLine,
        )
      );
    }
  }

  // 4. Call expressions: func(), object.method(), etc.
  if (node.type === 'CallExpression') {
    const callNode = node as unknown as {
      callee: AcornNode;
      arguments: AcornNode[];
    };
    if (
      containsVariable(
        callNode.callee,
        variableName,
        code,
        document,
        selectionLine,
      )
    ) {
      return true;
    }
    return callNode.arguments.some((arg) =>
      containsVariable(
        arg,
        variableName,
        code,
        document,
        selectionLine,
        visited,
        depth + 1,
      ),
    );
  }

  // 5. Binary expressions: a + b, x === y, etc.
  if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
    const binaryNode = node as unknown as { left: AcornNode; right: AcornNode };
    return (
      containsVariable(
        binaryNode.left,
        variableName,
        code,
        document,
        selectionLine,
      ) ||
      containsVariable(
        binaryNode.right,
        variableName,
        code,
        document,
        selectionLine,
      )
    );
  }

  // 6. Unary expressions: !flag, ++counter, typeof x, etc.
  if (node.type === 'UnaryExpression' || node.type === 'UpdateExpression') {
    const unaryNode = node as unknown as { argument: AcornNode };
    return containsVariable(
      unaryNode.argument,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 7. Conditional (ternary) expressions: condition ? a : b
  if (node.type === 'ConditionalExpression') {
    const ternaryNode = node as unknown as {
      test: AcornNode;
      consequent: AcornNode;
      alternate: AcornNode;
    };
    return (
      containsVariable(
        ternaryNode.test,
        variableName,
        code,
        document,
        selectionLine,
      ) ||
      containsVariable(
        ternaryNode.consequent,
        variableName,
        code,
        document,
        selectionLine,
      ) ||
      containsVariable(
        ternaryNode.alternate,
        variableName,
        code,
        document,
        selectionLine,
      )
    );
  }

  // 8. Array literals: [a, b, c]
  if (node.type === 'ArrayExpression') {
    const arrayNode = node as unknown as { elements: AcornNode[] };
    return arrayNode.elements.some((element) =>
      element
        ? containsVariable(
            element,
            variableName,
            code,
            document,
            selectionLine,
            visited,
            depth + 1,
          )
        : false,
    );
  }

  // 9. Object literals: { key: value }
  if (node.type === 'ObjectExpression') {
    const objectNode = node as unknown as { properties: AcornNode[] };
    return objectNode.properties.some((prop) => {
      if (prop.type === 'Property') {
        const propNode = prop as unknown as {
          key: AcornNode;
          value: AcornNode;
          shorthand: boolean;
        };
        return (
          containsVariable(
            propNode.key,
            variableName,
            code,
            document,
            selectionLine,
          ) ||
          containsVariable(
            propNode.value,
            variableName,
            code,
            document,
            selectionLine,
          )
        );
      }
      if (prop.type === 'SpreadElement') {
        const spreadNode = prop as unknown as { argument: AcornNode };
        return containsVariable(
          spreadNode.argument,
          variableName,
          code,
          document,
          selectionLine,
        );
      }
      return false;
    });
  }

  // 10. Template literals: `Hello ${name}`
  if (node.type === 'TemplateLiteral') {
    const templateNode = node as unknown as { expressions: AcornNode[] };
    return templateNode.expressions.some((expr) =>
      containsVariable(
        expr,
        variableName,
        code,
        document,
        selectionLine,
        visited,
        depth + 1,
      ),
    );
  }

  // 11. Tagged template literals: tag`template`
  if (node.type === 'TaggedTemplateExpression') {
    const taggedNode = node as unknown as { tag: AcornNode; quasi: AcornNode };
    return (
      containsVariable(
        taggedNode.tag,
        variableName,
        code,
        document,
        selectionLine,
      ) ||
      containsVariable(
        taggedNode.quasi,
        variableName,
        code,
        document,
        selectionLine,
      )
    );
  }

  // 12. Spread elements: ...array
  if (node.type === 'SpreadElement') {
    const spreadNode = node as unknown as { argument: AcornNode };
    return containsVariable(
      spreadNode.argument,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 13. Await expressions: await promise
  if (node.type === 'AwaitExpression') {
    const awaitNode = node as unknown as { argument: AcornNode };
    return containsVariable(
      awaitNode.argument,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 14. Arrow functions: (param) => expr
  if (node.type === 'ArrowFunctionExpression') {
    const arrowNode = node as unknown as {
      params: AcornNode[];
      body: AcornNode;
    };
    // Check if variable is used in the function body (but not as a parameter)
    const paramNames = arrowNode.params
      .filter((p) => isIdentifier(p))
      .map((p) => (p as { name: string }).name);
    if (paramNames.includes(variableName)) return false; // It's a parameter, not external variable

    return containsVariable(
      arrowNode.body,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 15. Function expressions: function() { ... }
  if (node.type === 'FunctionExpression') {
    const funcNode = node as unknown as {
      params: AcornNode[];
      body: AcornNode;
    };
    const paramNames = funcNode.params
      .filter((p) => isIdentifier(p))
      .map((p) => (p as { name: string }).name);
    if (paramNames.includes(variableName)) return false;

    return containsVariable(
      funcNode.body,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 16. Block statements: { ... }
  if (node.type === 'BlockStatement') {
    const blockNode = node as unknown as { body: AcornNode[] };
    return blockNode.body.some((stmt) =>
      containsVariable(
        stmt,
        variableName,
        code,
        document,
        selectionLine,
        visited,
        depth + 1,
      ),
    );
  }

  // 17. Expression statements
  if (node.type === 'ExpressionStatement') {
    const exprNode = node as unknown as { expression: AcornNode };
    return containsVariable(
      exprNode.expression,
      variableName,
      code,
      document,
      selectionLine,
    );
  }

  // 18. Sequence expressions: a, b, c
  if (node.type === 'SequenceExpression') {
    const seqNode = node as unknown as { expressions: AcornNode[] };
    return seqNode.expressions.some((expr) =>
      containsVariable(
        expr,
        variableName,
        code,
        document,
        selectionLine,
        visited,
        depth + 1,
      ),
    );
  }

  // 19. Assignment expressions: x = y
  if (node.type === 'AssignmentExpression') {
    const assignNode = node as unknown as { left: AcornNode; right: AcornNode };
    return (
      containsVariable(
        assignNode.left,
        variableName,
        code,
        document,
        selectionLine,
      ) ||
      containsVariable(
        assignNode.right,
        variableName,
        code,
        document,
        selectionLine,
      )
    );
  }

  // 20. New expressions: new Constructor()
  if (node.type === 'NewExpression') {
    const newNode = node as unknown as {
      callee: AcornNode;
      arguments: AcornNode[];
    };
    if (
      containsVariable(
        newNode.callee,
        variableName,
        code,
        document,
        selectionLine,
      )
    ) {
      return true;
    }
    return newNode.arguments.some((arg) =>
      containsVariable(
        arg,
        variableName,
        code,
        document,
        selectionLine,
        visited,
        depth + 1,
      ),
    );
  }

  // 21. Recursively check all child nodes for any other cases
  let found = false;
  walk(node, (child: AcornNode): boolean | void => {
    if (
      child !== node &&
      containsVariable(
        child,
        variableName,
        code,
        document,
        selectionLine,
        visited,
        depth + 1,
      )
    ) {
      found = true;
      return true; // Stop early
    }
  });

  return found;
}

/**
 * Helper function to get the full property access path
 * e.g., person.profile.name -> "person.profile.name"
 * e.g., user.meta?.city -> "user.meta?.city"
 */
function getPropertyAccessPath(node: AcornNode): string {
  const parts: string[] = [];

  let current: AcornNode = node;
  while (isMemberExpression(current)) {
    const memberNode = current as {
      object: AcornNode;
      property: AcornNode;
      computed: boolean;
      optional?: boolean;
    };

    if (memberNode.computed) {
      // For computed access like obj[key], we can't build a simple path
      break;
    }

    if (isIdentifier(memberNode.property)) {
      const propName = (memberNode.property as { name: string }).name;
      // Include the optional chaining operator if present
      if (memberNode.optional) {
        parts.unshift(`?.${propName}`);
      } else {
        parts.unshift(propName);
      }
    }
    current = memberNode.object;
  }

  if (isIdentifier(current)) {
    const baseName = (current as { name: string }).name;
    parts.unshift(baseName);
  }

  // Join parts, handling optional chaining properly
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    if (i === 0) {
      result = parts[i];
    } else if (parts[i].startsWith('?.')) {
      result += parts[i];
    } else {
      result += '.' + parts[i];
    }
  }

  return result;
}

/**
 * AST-driven helper to determine the line where to place the log message for a variable within a return statement
 * @param document - The VS Code text document
 * @param selectionLine - The line where the variable is selected
 * @param selectedVar - The selected variable name
 * @returns The line number where the log message should be placed
 */
export function withinReturnStatementLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const wanted = variableName.trim();
  if (!wanted) return selectionLine + 1;

  const code = document.getText();

  let returnStatementLine = -1;

  walk(ast, (node: AcornNode): boolean | void => {
    // Look for return statements
    if (node.type === 'ReturnStatement') {
      const start = document.positionAt(node.start).line;
      const end = document.positionAt(node.end).line;
      // Check if the selection line is within the return statement
      if (selectionLine >= start && selectionLine <= end) {
        const returnNode = node as unknown as { argument?: AcornNode };
        // Check if the return statement contains the target variable
        if (returnNode.argument) {
          const contains = containsVariable(
            returnNode.argument,
            wanted,
            code,
            document,
            selectionLine,
          );
          if (contains) {
            returnStatementLine = start;
            return true; // Stop early
          }
        }
      }
    }
  });

  // Return the line before the return statement, or fallback to next line
  return returnStatementLine !== -1 ? returnStatementLine : selectionLine + 1;
}
