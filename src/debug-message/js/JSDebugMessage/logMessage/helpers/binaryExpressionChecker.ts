import ts from 'typescript';
import { TextDocument } from 'vscode';

export function binaryExpressionChecker(
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

    if (ts.isVariableDeclaration(node)) {
      const start = document.positionAt(node.getStart()).line;
      const end = document.positionAt(node.getEnd()).line;
      if (selectionLine < start || selectionLine > end) return;

      // ── ① IDENTIFIER CASE ───────────────────────────────
      if (ts.isIdentifier(node.name)) {
        if (
          node.name.text === wanted &&
          node.initializer &&
          containsBinary(node.initializer)
        ) {
          isChecked = true;
          return;
        }
      }

      // ── ② DESTRUCTURING CASE ───────────────────────────
      if (
        ts.isObjectBindingPattern(node.name) ||
        ts.isArrayBindingPattern(node.name)
      ) {
        const binding = findBindingElement(node.name, wanted);
        if (binding && node.initializer && containsBinary(node.initializer)) {
          isChecked = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}

/*──────────── helpers ────────────*/

function findBindingElement(
  pattern: ts.ObjectBindingPattern | ts.ArrayBindingPattern,
  wanted: string,
): ts.BindingElement | undefined {
  for (const el of pattern.elements) {
    if (ts.isOmittedExpression(el)) continue;
    if (!ts.isBindingElement(el)) continue;

    const { name } = el;

    if (ts.isIdentifier(name) && name.text === wanted) {
      return el;
    }

    if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      const inner = findBindingElement(name, wanted);
      if (inner) return inner;
    }
  }

  return undefined;
}

function containsBinary(node: ts.Node): boolean {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return containsBinary(node.expression);
  }

  if (ts.isBinaryExpression(node)) return true;

  return ts.forEachChild(node, containsBinary) ?? false;
}
