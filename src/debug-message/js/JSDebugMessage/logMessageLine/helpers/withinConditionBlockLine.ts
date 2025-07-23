import ts from 'typescript';
import { TextDocument } from 'vscode';

export function withinConditionBlockLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
  );

  let targetLine = selectionLine + 1;

  ts.forEachChild(sourceFile, function visit(node): void {
    let condition: ts.Expression | undefined;
    let block: ts.Block | ts.Statement | undefined;

    // Extract condition and block based on statement type
    if (ts.isIfStatement(node)) {
      condition = node.expression;
      block = node.thenStatement;
    } else if (ts.isWhileStatement(node)) {
      condition = node.expression;
      block = node.statement;
    } else if (ts.isForStatement(node)) {
      condition = node.condition;
      block = node.statement;
    } else if (ts.isForInStatement(node)) {
      condition = node.expression;
      block = node.statement;
    } else if (ts.isForOfStatement(node)) {
      condition = node.expression;
      block = node.statement;
    }

    if (condition && block) {
      const conditionStart = document.positionAt(condition.getStart()).line;
      const conditionEnd = document.positionAt(condition.getEnd()).line;

      // Check if selection is within the condition
      if (selectionLine >= conditionStart && selectionLine <= conditionEnd) {
        // Check if the wanted variable appears in the condition
        if (containsPropertyAccess(condition, variableName.trim())) {
          // Always insert before the start of the if block (the line where the if statement begins)
          const ifStart = document.positionAt(node.getStart()).line;
          targetLine = ifStart;
          return;
        }
      }
    }

    // Handle conditional expressions (ternary operators)
    if (ts.isConditionalExpression(node)) {
      const conditionStart = document.positionAt(
        node.condition.getStart(),
      ).line;
      const conditionEnd = document.positionAt(node.condition.getEnd()).line;

      if (selectionLine >= conditionStart && selectionLine <= conditionEnd) {
        if (containsPropertyAccess(node.condition, variableName.trim())) {
          // For ternary expressions, insert after the entire expression
          const expressionEnd = document.positionAt(node.getEnd()).line;
          targetLine = expressionEnd + 1;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return targetLine;
}

function containsPropertyAccess(node: ts.Node, variableName: string): boolean {
  // Check if this node is a property access expression that includes our variable
  if (ts.isPropertyAccessExpression(node)) {
    const fullText = node.getText();
    if (fullText.includes(variableName)) {
      return true;
    }
  }

  // Check if this node is an identifier that matches our variable
  if (ts.isIdentifier(node) && node.text === variableName) {
    return true;
  }

  // Recursively check children
  return (
    ts.forEachChild(node, (child) =>
      containsPropertyAccess(child, variableName),
    ) ?? false
  );
}
