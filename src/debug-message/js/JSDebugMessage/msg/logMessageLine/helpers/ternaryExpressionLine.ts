import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type ConditionalExpression,
  isConditionalExpression,
  isIdentifier,
  findBindingDeclaration,
  walk,
} from '../../acorn-utils';

export function ternaryExpressionLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // ─── 1) Declarations: after the whole declaration statement ─────────────
  const declaration = findBindingDeclaration(ast, selectionLine, variableName);
  if (declaration) {
    return document.positionAt(declaration.end).line + 1;
  }

  // ─── 2) Fallback: the ternary whose condition contains our variable ─────
  const condNode = findConditionalWithTest(
    ast,
    document,
    selectionLine,
    variableName,
  );

  // ─── 3) Nothing matched? just next line ─────────────────────────────────
  if (!condNode) {
    return selectionLine + 1;
  }

  // ─── 4) Crawl the *entire* ternary subtree for its deepest end line ──────
  let maxEndLine = 0;
  walk(condNode, (n: AcornNode): void => {
    const line = document.positionAt(n.end).line;
    if (line > maxEndLine) maxEndLine = line;
  });

  // ─── 5) Return one line past the deepest descendant ────────────────────
  return maxEndLine + 1;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Smallest ternary whose test references the variable, preferring those covering the selection. */
function findConditionalWithTest(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): ConditionalExpression | undefined {
  const candidates: ConditionalExpression[] = [];
  walk(ast, (n: AcornNode): void => {
    if (
      isConditionalExpression(n) &&
      containsIdentifier((n as ConditionalExpression).test, variableName)
    ) {
      candidates.push(n as ConditionalExpression);
    }
  });
  if (!candidates.length) return undefined;

  // prefer those covering your cursor line
  const covering = candidates.filter((n) => {
    const start = document.positionAt(n.start).line;
    const end = document.positionAt(n.end).line;
    return selectionLine >= start && selectionLine <= end;
  });
  const pool = covering.length ? covering : candidates;

  // pick the smallest span
  let best = pool[0];
  let bestSpan =
    document.positionAt(best.end).line - document.positionAt(best.start).line;
  for (const c of pool) {
    const span =
      document.positionAt(c.end).line - document.positionAt(c.start).line;
    if (span < bestSpan) {
      best = c;
      bestSpan = span;
    }
  }
  return best;
}

function containsIdentifier(node: AcornNode, name: string): boolean {
  let contains = false;
  walk(node, (n: AcornNode): boolean | void => {
    if (isIdentifier(n) && (n as { name: string }).name === name) {
      contains = true;
      return true; // Stop early
    }
  });
  return contains;
}
