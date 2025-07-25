import ts from 'typescript';
import { TextDocument } from 'vscode';

export function ternaryChecker(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const wanted = variableName.trim();
  if (!wanted) return { isChecked: false };

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
          containsTernary(node.initializer)
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
        if (
          binding &&
          binding.initializer &&
          containsTernary(binding.initializer)
        ) {
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

    // ── Direct match
    if (ts.isIdentifier(name) && name.text === wanted) {
      return el;
    }

    // ── Recursively go inside the nested pattern
    if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      const inner = findBindingElement(name, wanted);
      if (inner) return inner;
    }

    // ── NEW: If name is identifier, but el.name was alias like config: { ... }
    if (ts.isIdentifier(name) && ts.isObjectBindingPattern(el.name)) {
      const inner = findBindingElement(el.name, wanted);
      if (inner) return inner;
    }
  }

  return undefined;
}

function containsTernary(node: ts.Node): boolean {
  if (!node) return false;

  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return containsTernary(node.expression);
  }

  if (ts.isConditionalExpression(node)) return true;

  return ts.forEachChild(node, containsTernary) ?? false;
}
