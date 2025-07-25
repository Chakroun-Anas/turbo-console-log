import ts from 'typescript';
import { TextDocument } from 'vscode';

export function ternaryExpressionLine(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // ─── 1) Scope to the variable declarator if possible ─────────────────────
  let condNode: ts.ConditionalExpression | undefined;
  const decl = findVariableDeclaration(sourceFile, variableName);
  if (decl && decl.initializer) {
    if (ts.isConditionalExpression(decl.initializer)) {
      condNode = decl.initializer;
    } else {
      condNode = findFirstConditional(decl.initializer);
    }
  }

  // ─── 2) Fallback: find any ternary whose condition contains our variable ───
  if (!condNode) {
    const candidates: ts.ConditionalExpression[] = [];
    (function collect(n: ts.Node) {
      if (
        ts.isConditionalExpression(n) &&
        containsIdentifier(n.condition, variableName)
      ) {
        candidates.push(n);
      }
      ts.forEachChild(n, collect);
    })(sourceFile);

    if (candidates.length) {
      // prefer those covering your cursor line
      const covering = candidates.filter((n) => {
        const start = document.positionAt(n.getStart()).line;
        const end = document.positionAt(n.getEnd()).line;
        return selectionLine >= start && selectionLine <= end;
      });
      const pool = covering.length ? covering : candidates;

      // pick the smallest span
      let best = pool[0];
      let bestSpan =
        document.positionAt(best.getEnd()).line -
        document.positionAt(best.getStart()).line;
      for (const c of pool) {
        const span =
          document.positionAt(c.getEnd()).line -
          document.positionAt(c.getStart()).line;
        if (span < bestSpan) {
          best = c;
          bestSpan = span;
        }
      }
      condNode = best;
    }
  }

  // ─── 3) Nothing matched? just next line ─────────────────────────────────
  if (!condNode) {
    return selectionLine + 1;
  }

  // ─── 4) Crawl the *entire* ternary subtree for its deepest end line ──────
  let maxEndLine = 0;
  (function crawl(n: ts.Node) {
    const line = document.positionAt(n.getEnd()).line;
    if (line > maxEndLine) maxEndLine = line;
    ts.forEachChild(n, crawl);
  })(condNode);

  // ─── 5) Return one line past the deepest descendant ────────────────────
  return maxEndLine + 1;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function findVariableDeclaration(
  root: ts.Node,
  name: string,
): ts.VariableDeclaration | undefined {
  let found: ts.VariableDeclaration | undefined;
  ts.forEachChild(root, function walk(n) {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.name.text === name
    ) {
      found = n;
      return;
    }
    ts.forEachChild(n, walk);
  });
  return found;
}

function findFirstConditional(
  root: ts.Node,
): ts.ConditionalExpression | undefined {
  let found: ts.ConditionalExpression | undefined;
  ts.forEachChild(root, function walk(n) {
    if (found) return;
    if (ts.isConditionalExpression(n)) {
      found = n;
      return;
    }
    ts.forEachChild(n, walk);
  });
  return found;
}

function containsIdentifier(node: ts.Node, name: string): boolean {
  if (ts.isIdentifier(node) && node.text === name) return true;
  return ts.forEachChild(node, (child) =>
    containsIdentifier(child, name),
  ) as boolean;
}
