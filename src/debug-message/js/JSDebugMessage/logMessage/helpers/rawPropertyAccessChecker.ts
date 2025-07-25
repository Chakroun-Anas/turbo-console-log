import ts from 'typescript';
import { Position, TextDocument } from 'vscode';
import { LogContextMetadata } from '@/entities';

export function rawPropertyAccessChecker(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
) {
  // Find the selection in the line
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(selectedText);
  if (charIndex === -1) {
    return { isChecked: false };
  }
  const startOffset = document.offsetAt(new Position(selectionLine, charIndex));
  const endOffset = startOffset + selectedText.length;

  // Locate the matching node
  let matchedNode: ts.Node | undefined;
  function visit(node: ts.Node) {
    // 1) propertyAssignment: e.g. `mother: {...}` or `age: 28`
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === selectedText &&
      node.name.getStart(sourceFile) <= startOffset &&
      node.name.getEnd() >= endOffset
    ) {
      matchedNode = node; // ← note: **node**, not node.name
      return;
    }

    // 2) propertyAccess: e.g. `person.family.mother`
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === selectedText &&
      node.getStart(sourceFile) <= startOffset &&
      node.getEnd() >= endOffset
    ) {
      matchedNode = node;
      return;
    }

    // 3) elementAccess: e.g. `person['age']`
    if (
      ts.isElementAccessExpression(node) &&
      node.argumentExpression
        .getText(sourceFile)
        .replace(/^['"]|['"]$/g, '') === selectedText &&
      node.getStart(sourceFile) <= startOffset &&
      node.getEnd() >= endOffset
    ) {
      matchedNode = node;
      return;
    }

    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  if (!matchedNode) {
    return { isChecked: false };
  }

  // Build the full path: climb up through assignments → object literals → var decl
  const pathParts: string[] = [];
  let current: ts.Node | undefined = matchedNode;

  while (current) {
    if (ts.isPropertyAccessExpression(current)) {
      pathParts.unshift(current.name.text);
      current = current.expression;
    } else if (ts.isElementAccessExpression(current)) {
      // strip quotes from argument
      const raw = current.argumentExpression.getText(sourceFile);
      const arg = raw.slice(1, -1);
      pathParts.unshift(arg);
      current = current.expression;
    } else if (ts.isPropertyAssignment(current)) {
      const name =
        ts.isIdentifier(current.name) || ts.isStringLiteral(current.name)
          ? current.name.text
          : current.name.getText(sourceFile);
      pathParts.unshift(name);
      current = current.parent; // move up to ObjectLiteral
    } else if (ts.isObjectLiteralExpression(current)) {
      current = current.parent; // to the next PropertyAssignment or VariableDeclaration
    } else if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name)
    ) {
      pathParts.unshift(current.name.text); // e.g. "person"
      break;
    } else {
      current = current.parent;
    }
  }

  return {
    isChecked: true,
    metadata: {
      deepObjectPath: pathParts.join('.'),
    } as LogContextMetadata,
  };
}
