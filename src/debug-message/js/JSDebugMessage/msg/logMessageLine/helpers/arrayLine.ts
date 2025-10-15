import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isVariableDeclaration,
  isArrayExpression,
  isIdentifier,
  isAssignmentExpression,
  walk,
} from '../../acorn-utils';

export function arrayLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let targetEnd = -1;

  const sourceCode = document.getText();

  walk(ast, (node: AcornNode): boolean | void => {
    if (targetEnd !== -1) return true; // Already found

    // Handle direct variable assignment: const a = [...]
    if (isVariableDeclaration(node) && node.declarations.length > 0) {
      for (const decl of node.declarations) {
        if (decl.start === undefined || decl.end === undefined || !decl.init) {
          continue;
        }

        const declStartLine = document.positionAt(decl.start).line;
        if (declStartLine !== selectionLine) continue;

        // Check if the variable name matches
        const id = decl.id;
        if (isIdentifier(id) && id.name === variableName) {
          // Check if the initializer is an array
          if (isArrayExpression(decl.init)) {
            if (decl.init.end !== undefined) {
              targetEnd = decl.init.end;
              return true;
            }
          }
        }
      }
    }

    // Handle property assignment: config.module.rules = [...]
    if (node.type === 'ExpressionStatement') {
      const expr = (node as { expression?: AcornNode }).expression;
      if (expr && isAssignmentExpression(expr)) {
        if (node.start === undefined) return;

        const exprStartLine = document.positionAt(node.start).line;
        if (exprStartLine !== selectionLine) return;

        const left = (expr as { left?: AcornNode }).left;
        const right = (expr as { right?: AcornNode }).right;

        // Get the text of the left side (e.g., "config.module.rules")
        if (
          left &&
          left.start !== undefined &&
          left.end !== undefined &&
          right
        ) {
          const leftText = sourceCode.substring(left.start, left.end);
          if (leftText === variableName && isArrayExpression(right)) {
            if (right.end !== undefined) {
              targetEnd = right.end;
              return true;
            }
          }
        }
      }
    }
  });

  if (targetEnd === -1) return selectionLine + 1;

  const { line } = document.positionAt(targetEnd);
  return line + 1;
}
