import ts from 'typescript';
import { TextDocument } from 'vscode';

function isPrimitiveRHS(expr: ts.Expression): boolean {
  switch (expr.kind) {
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
      return true;

    case ts.SyntaxKind.Identifier:
      return true; // covers bare identifiers like `foo`

    case ts.SyntaxKind.PropertyAccessExpression: {
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
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
  );

  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node: ts.Node): void {
    if (isChecked) return;

    const start = document.positionAt(node.getStart()).line;
    const end = document.positionAt(node.getEnd()).line;
    if (selectionLine < start || selectionLine > end) return;

    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length
    ) {
      for (const decl of node.declarationList.declarations) {
        const { name, initializer } = decl;
        if (!initializer || !isPrimitiveRHS(initializer)) continue;

        // Handle direct assignment: const foo = 42;
        if (ts.isIdentifier(name) && name.text === variableName) {
          isChecked = true;
          return;
        }

        // Handle destructuring: const { foo } = user;
        if (ts.isObjectBindingPattern(name)) {
          for (const element of name.elements) {
            if (
              ts.isBindingElement(element) &&
              ts.isIdentifier(element.name) &&
              element.name.text === variableName
            ) {
              isChecked = true;
              return;
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}
