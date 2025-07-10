import ts from 'typescript';
import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

/**
 * Returns true when the RHS of the variable declaration is a
 * primitive literal OR a plain identifier / dotted path
 * (e.g. foo, foo.bar.baz) — but NOT an object/array/func/etc.
 */
function isPrimitiveInitializer(expr: ts.Expression): boolean {
  switch (expr.kind) {
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
      return true;

    case ts.SyntaxKind.Identifier:
      return (
        (expr as ts.Identifier).escapedText === 'undefined' || // special-case
        true
      ); // any other bare identifier

    case ts.SyntaxKind.PropertyAccessExpression: {
      // ensure every segment is a simple identifier (foo.bar.baz)
      let node: ts.Expression = expr;
      while (ts.isPropertyAccessExpression(node)) {
        if (!ts.isIdentifier(node.name)) return false;
        node = node.expression;
      }
      return ts.isIdentifier(node);
    }

    default:
      return false;
  }
}

export function primitiveAssignmentChecker(
  document: TextDocument,
  _lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
): { isChecked: boolean } {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
  );

  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node: ts.Node): void {
    if (isChecked) return;

    const start = document.positionAt(node.getStart()).line;
    const end = document.positionAt(node.getEnd()).line;
    if (selectionLine < start || selectionLine > end) return;

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        // 🛑 Bail out if it's destructuring!
        if (
          ts.isObjectBindingPattern(decl.name) ||
          ts.isArrayBindingPattern(decl.name)
        ) {
          return;
        }

        if (decl.initializer && isPrimitiveInitializer(decl.initializer)) {
          isChecked = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}
