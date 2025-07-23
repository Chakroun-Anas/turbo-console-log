import ts from 'typescript';
import { TextDocument } from 'vscode';
import { BlockType } from '@/entities';

export function enclosingBlockName(
  document: TextDocument,
  selectionLine: number,
  blockType: BlockType,
): string {
  const sourceCode = document.getText();
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  let bestMatch: {
    name: string;
    depth: number;
  } | null = null;

  function visit(node: ts.Node, depth: number = 0) {
    const startLine = document.positionAt(node.getStart()).line;
    const endLine = document.positionAt(node.getEnd()).line;

    const isInside = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInside) {
      ts.forEachChild(node, (child) => visit(child, depth + 1));
      return;
    }

    let candidateName: string | null = null;

    if (blockType === 'class' && ts.isClassDeclaration(node) && node.name) {
      candidateName = node.name.text;
    }

    if (blockType === 'function') {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node)
      ) {
        if ('name' in node && node.name && ts.isIdentifier(node.name)) {
          candidateName = node.name.text;
        } else if (
          ts.isVariableDeclaration(node.parent) &&
          ts.isIdentifier(node.parent.name)
        ) {
          candidateName = node.parent.name.text;
        }
      } else if (ts.isConstructorDeclaration(node)) {
        candidateName = 'constructor';
      }
    }

    if (candidateName && (!bestMatch || depth > bestMatch.depth)) {
      bestMatch = { name: candidateName, depth };
    }

    // Continue walking the tree
    ts.forEachChild(node, (child) => visit(child, depth + 1));
  }

  visit(sourceFile);

  return (
    (
      bestMatch as {
        name: string;
        depth: number;
      } | null
    )?.name ?? ''
  );
}
