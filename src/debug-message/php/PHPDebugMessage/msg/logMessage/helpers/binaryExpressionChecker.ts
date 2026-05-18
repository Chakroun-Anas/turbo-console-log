/**
 * Helper function to check if the selected code is a binary expression.
 *
 * Binary expressions include:
 * - Arithmetic: +, -, *, /, %, **
 * - Logical: &&, ||, and, or, xor
 * - Comparison: ==, ===, !=, !==, <, >, <=, >=, <=>
 * - Bitwise: &, |, ^, <<, >>
 * - String: . (concatenation)
 * - Null coalescing: ??, ??=
 * - Assignment: +=, -=, *=, /=, .=, etc.
 *
 * Example: $total = $price + $tax
 * Where selection is "$price + $tax"
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';
import { isBin } from '../../php-parser-utils/guards';

/**
 * Get the text representation of a node by extracting lines from the document
 */
function getNodeText(node: PHPNode, document: TextDocument): string {
  if (!node.loc) return '';

  const startLine = node.loc.start.line - 1;
  const endLine = node.loc.end.line - 1;
  const startColumn = node.loc.start.column;
  const endColumn = node.loc.end.column;

  if (startLine === endLine) {
    return document.lineAt(startLine).text.substring(startColumn, endColumn);
  }

  // Multi-line node
  const lines: string[] = [];
  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text;
    if (i === startLine) {
      lines.push(lineText.substring(startColumn));
    } else if (i === endLine) {
      lines.push(lineText.substring(0, endColumn));
    } else {
      lines.push(lineText);
    }
  }
  return lines.join('\n');
}

export function binaryExpressionChecker(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  walk(ast, (node: PHPNode): void => {
    if (isChecked) return;

    // We're looking for a Bin node (binary expression)
    if (!isBin(node)) {
      return;
    }

    // Check if node is on the selected line
    if (!node.loc) {
      return;
    }
    const nodeStartLine = node.loc.start.line - 1;
    const nodeEndLine = node.loc.end.line - 1;

    if (selectionLine < nodeStartLine || selectionLine > nodeEndLine) {
      return;
    }

    // Get the text of this node
    const nodeText = getNodeText(node, document);
    const normalizedNodeText = nodeText.replace(/\s+/g, '').trim();
    const normalizedSelectedVar = selectedVar.replace(/\s+/g, '').trim();

    // Check if this node matches the selection
    if (normalizedNodeText === normalizedSelectedVar) {
      isChecked = true;
    }
  });

  return { isChecked };
}
