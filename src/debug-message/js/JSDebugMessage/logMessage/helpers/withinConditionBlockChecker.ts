import ts from 'typescript';
import { TextDocument } from 'vscode';

export function withinConditionBlockChecker(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const wanted = variableName.trim();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );

  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node): void {
    if (isChecked) return;

    // Only handle if statement conditions
    if (ts.isIfStatement(node)) {
      const condition = node.expression;
      const conditionStart = document.positionAt(condition.getStart()).line;
      const conditionEnd = document.positionAt(condition.getEnd()).line;
      // Check if selection is within the condition
      if (selectionLine >= conditionStart && selectionLine <= conditionEnd) {
        // Check if the wanted variable appears as a property access in the condition
        if (containsPropertyAccess(condition, wanted)) {
          isChecked = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
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
