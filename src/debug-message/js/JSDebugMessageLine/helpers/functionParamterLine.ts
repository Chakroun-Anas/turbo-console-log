import ts from 'typescript';
import { TextDocument, Position } from 'vscode';

/**
 * Determines the appropriate line to insert a log
 * for a function parameter.
 */
export function functionParameterLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const lineText = document.lineAt(selectionLine).text;
  const col = Math.max(lineText.indexOf(variableName), 0); // fallback to 0
  const offset = document.offsetAt(new Position(selectionLine, col));
  const source = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
  );

  const leaf = findNodeAtOffset(source, offset);
  if (!leaf) return selectionLine + 1;

  // Climb to the enclosing function-like node
  let node: ts.Node | undefined = leaf;
  while (node && !isFunctionLike(node)) node = node.parent;
  if (!node) return selectionLine + 1;

  const func = node as ts.FunctionLikeDeclaration;
  if (func.body && ts.isBlock(func.body)) {
    const bracePos = document.positionAt(func.body.getStart());
    const braceLine = bracePos.line;
    const braceLineText = document.lineAt(braceLine).text;

    const inlineEmpty = /\{\s*\}/.test(braceLineText); // fixed logic
    if (inlineEmpty) return braceLine;

    const braceAtLineEnd = braceLineText.trim().endsWith('{');
    const target = braceAtLineEnd ? braceLine + 1 : braceLine;

    return Math.min(target, document.lineCount - 1);
  }

  // Concise arrow function with single expression — fallback
  return selectionLine + 1;
}

/*──────────── helpers ────────────*/

function findNodeAtOffset(root: ts.Node, offset: number): ts.Node | null {
  let found: ts.Node | null = null;
  function visit(n: ts.Node) {
    if (offset >= n.getFullStart() && offset <= n.getEnd()) {
      found = n;
      ts.forEachChild(n, visit);
    }
  }
  visit(root);
  return found;
}

function isFunctionLike(n: ts.Node): n is ts.FunctionLikeDeclaration {
  return (
    ts.isFunctionDeclaration(n) ||
    ts.isFunctionExpression(n) ||
    ts.isArrowFunction(n) ||
    ts.isMethodDeclaration(n) ||
    ts.isConstructorDeclaration(n)
  );
}
