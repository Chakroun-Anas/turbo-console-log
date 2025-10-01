import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  type ConditionalExpression,
  isConditionalExpression,
  isVariableDeclaration,
  isIdentifier,
  walk,
} from '../../acorn-utils';

export function ternaryExpressionLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // ─── 1) Scope to the variable declarator if possible ─────────────────────

  let condNode: ConditionalExpression | undefined;
  const decl = findVariableDeclaration(ast, variableName);
  if (decl && decl.init) {
    if (isConditionalExpression(decl.init)) {
      condNode = decl.init as ConditionalExpression;
    } else {
      condNode = findFirstConditional(decl.init);
    }
  }

  // ─── 2) Fallback: find any ternary whose condition contains our variable ───
  if (!condNode) {
    const candidates: ConditionalExpression[] = [];
    walk(ast, (n: AcornNode): void => {
      if (
        isConditionalExpression(n) &&
        containsIdentifier((n as ConditionalExpression).test, variableName)
      ) {
        candidates.push(n as ConditionalExpression);
      }
    });

    if (candidates.length) {
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
        document.positionAt(best.end).line -
        document.positionAt(best.start).line;
      for (const c of pool) {
        const span =
          document.positionAt(c.end).line - document.positionAt(c.start).line;
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
  walk(condNode, (n: AcornNode): void => {
    const line = document.positionAt(n.end).line;
    if (line > maxEndLine) maxEndLine = line;
  });

  // ─── 5) Return one line past the deepest descendant ────────────────────
  return maxEndLine + 1;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function findVariableDeclaration(
  root: AcornNode,
  name: string,
): { id: AcornNode; init: AcornNode } | undefined {
  let found: { id: AcornNode; init: AcornNode } | undefined;
  walk(root, (n: AcornNode): boolean | void => {
    if (isVariableDeclaration(n)) {
      const varDecl = n as VariableDeclaration;
      for (const decl of varDecl.declarations) {
        if (
          isIdentifier(decl.id) &&
          (decl.id as { name: string }).name === name &&
          decl.init
        ) {
          found = decl as { id: AcornNode; init: AcornNode };
          return true; // Stop early
        }
      }
    }
  });
  return found;
}

function findFirstConditional(
  root: AcornNode,
): ConditionalExpression | undefined {
  let found: ConditionalExpression | undefined;
  walk(root, (n: AcornNode): boolean | void => {
    if (isConditionalExpression(n)) {
      found = n as ConditionalExpression;
      return true; // Stop early
    }
  });
  return found;
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
