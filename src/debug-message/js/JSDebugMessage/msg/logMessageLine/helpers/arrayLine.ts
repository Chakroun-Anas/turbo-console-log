import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isArrayExpression,
  isAssignmentExpression,
  isExpressionStatement,
  findBindingDeclaration,
  walk,
} from '../../acorn-utils';

export function arrayLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Handle declarations: const a = [...]
  const declaration = findBindingDeclaration(ast, selectionLine, variableName);
  if (declaration) {
    return document.positionAt(declaration.end).line + 1;
  }

  let targetEnd = -1;
  const sourceCode = document.getText();

  // Handle property assignment: config.module.rules = [...]
  walk(ast, (node: AcornNode): boolean | void => {
    if (targetEnd !== -1) return true; // Already found
    if (!isExpressionStatement(node)) return;

    const expr = node.expression;
    if (!isAssignmentExpression(expr)) return;
    if (document.positionAt(node.start).line !== selectionLine) return;

    const { left, right } = expr;
    const leftText = sourceCode.substring(left.start, left.end);
    if (leftText === variableName && isArrayExpression(right)) {
      targetEnd = right.end;
      return true;
    }
  });

  if (targetEnd === -1) return selectionLine + 1;

  return document.positionAt(targetEnd).line + 1;
}
