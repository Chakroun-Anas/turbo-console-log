import ts from 'typescript';
import { TextDocument } from 'vscode';

export function needTransformation(
  document: TextDocument,
  line: number,
  selectedVar: string,
): boolean {
  const sourceCode = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  let transformationNeeded = false;

  function positionToLine(pos: number) {
    // Convert offset to line (for fuzzy checks)
    const before = sourceCode.slice(0, pos);
    return before.split('\n').length - 1;
  }

  function visit(node: ts.Node) {
    if (transformationNeeded) return;

    // Handle arrow functions needing transformation
    if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
      const param = node.parameters.find(
        (p) => ts.isIdentifier(p.name) && p.name.text === selectedVar,
      );
      if (param) {
        const startLine = positionToLine(node.getFullStart());
        const endLine = positionToLine(node.getEnd());
        if (line >= startLine && line <= endLine) {
          transformationNeeded = true;
          return;
        }
      }
    }

    // Handle empty function declaration
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isConstructorDeclaration(node)) &&
      node.body &&
      node.body.statements.length === 0
    ) {
      const param = node.parameters.find(
        (p) => ts.isIdentifier(p.name) && p.name.text === selectedVar,
      );
      if (param) {
        const startLine = positionToLine(node.getFullStart());
        const endLine = positionToLine(node.getEnd());
        if (line >= startLine && line <= endLine) {
          transformationNeeded = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return transformationNeeded;
}
