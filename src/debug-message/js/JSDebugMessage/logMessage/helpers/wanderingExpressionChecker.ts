import ts from 'typescript';
import { TextDocument, Position } from 'vscode';

export function wanderingExpressionChecker(
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
): { isChecked: boolean } {
  const code = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
  );

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

  let matched = false;

  function isWandering(node: ts.Node): boolean {
    const parent = node.parent;

    // Exclude if selected node is a declaration name
    if (
      (ts.isVariableDeclaration(parent) && parent.name === node) ||
      (ts.isPropertyAssignment(parent) && parent.name === node)
    ) {
      return false;
    }

    // Exclude object literal keys
    if (ts.isObjectLiteralExpression(parent)) {
      return false;
    }

    // Exclude function parameters (referenced usage)
    let current = node.parent;
    while (current) {
      if (
        ts.isFunctionDeclaration(current) ||
        ts.isFunctionExpression(current) ||
        ts.isArrowFunction(current)
      ) {
        const paramNames = current.parameters.map((p) =>
          ts.isIdentifier(p.name) ? p.name.text : null,
        );
        if (ts.isIdentifier(node) && paramNames.includes(node.text)) {
          return false;
        }
        break;
      }
      current = current.parent;
    }

    return true;
  }

  function visit(node: ts.Node) {
    const nodeStart = node.getStart(sourceFile);
    const nodeEnd = node.getEnd();
    const nodeText = node.getText(sourceFile).trim();

    const isPotential =
      nodeText === trimmedText &&
      potentialMatches.some((m) => m.start === nodeStart && m.end === nodeEnd);

    if (
      isPotential &&
      (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) &&
      isWandering(node)
    ) {
      matched = true;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { isChecked: matched };
}
