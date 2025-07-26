import ts from 'typescript';
import { TextDocument } from 'vscode';

/**
 * Determines the appropriate line to insert a log
 * for a function parameter.
 */
export function functionParameterLine(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  // Find the parameter node that matches our variable name and is on the selection line
  const parameterNode = findParameterNodeOnLine(
    sourceFile,
    selectionLine,
    variableName,
    document,
  );
  if (!parameterNode) return selectionLine + 1;

  // Find the function that contains this parameter
  let node: ts.Node | undefined = parameterNode;
  while (node && !isFunctionLike(node)) node = node.parent;
  if (!node) return selectionLine + 1;

  const func = node as ts.FunctionLikeDeclaration;
  if (func.body && ts.isBlock(func.body)) {
    const bracePos = document.positionAt(func.body.getStart());
    const braceLine = bracePos.line;
    const braceLineText = document.lineAt(braceLine).text;

    const inlineEmpty = /\{\s*\}/.test(braceLineText);
    if (inlineEmpty) return braceLine + 1;

    const braceAtLineEnd = braceLineText.trim().endsWith('{');
    const target = braceAtLineEnd ? braceLine + 1 : braceLine;

    return Math.min(target, document.lineCount - 1);
  }

  // Concise arrow function with single expression — fallback
  return selectionLine + 1;
}

/*──────────── helpers ────────────*/

function findParameterNodeOnLine(
  root: ts.Node,
  selectionLine: number,
  variableName: string,
  document: TextDocument,
): ts.Node | null {
  let foundParameter: ts.Node | null = null;

  function visit(node: ts.Node): void {
    // Check if this node is a parameter identifier that matches our criteria
    if (ts.isIdentifier(node) && node.text === variableName) {
      const nodePos = document.positionAt(node.getStart());
      if (nodePos.line === selectionLine) {
        // Check if this identifier is actually a parameter or part of a parameter destructuring
        let parent = node.parent;

        // Handle direct parameter case
        if (parent && ts.isParameter(parent) && parent.name === node) {
          foundParameter = node;
          return;
        }

        // Handle destructuring pattern case (e.g., { title, onClick })
        while (parent) {
          if (ts.isParameter(parent)) {
            foundParameter = node;
            return;
          }
          parent = parent.parent;
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(root);
  return foundParameter;
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
