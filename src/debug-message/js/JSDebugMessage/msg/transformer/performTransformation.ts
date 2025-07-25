import ts from 'typescript';
import vscode from 'vscode';

interface TransformationOptions {
  addSemicolonInTheEnd: boolean;
  tabSize: number;
}

export function performTransformation(
  document: vscode.TextDocument,
  line: number,
  selectedVar: string,
  debuggingMsg: string,
  options: TransformationOptions,
): string {
  const sourceCode = document.getText();

  const sourceFile = ts.createSourceFile(
    document.fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const positionToLine = (pos: number) =>
    sourceCode.slice(0, pos).split('\n').length - 1;

  const trimmed = debuggingMsg.trim();
  const normalized =
    options.addSemicolonInTheEnd && !trimmed.endsWith(';')
      ? trimmed + ';'
      : !options.addSemicolonInTheEnd && trimmed.endsWith(';')
        ? trimmed.slice(0, -1)
        : trimmed;

  const PLACEHOLDER = '__DEBUG_PLACEHOLDER__';
  const debugStmt = ts.factory.createExpressionStatement(
    ts.factory.createIdentifier(PLACEHOLDER),
  );

  let transformedNode: ts.Node | null = null;
  let start = -1;
  let end = -1;

  const transformer: ts.TransformerFactory<ts.SourceFile> = (ctx) => {
    const visit: ts.Visitor = (node) => {
      const startLine = positionToLine(node.getFullStart());
      const endLine = positionToLine(node.getEnd());
      const inRange = line >= startLine && line <= endLine;

      // 🟩 Arrow Function (no block)
      if (
        ts.isArrowFunction(node) &&
        !ts.isBlock(node.body) &&
        inRange &&
        node.parameters.some(
          (p) => ts.isIdentifier(p.name) && p.name.text === selectedVar,
        )
      ) {
        const returnStmt = ts.factory.createReturnStatement(
          node.body as ts.Expression,
        );
        const block = ts.factory.createBlock([debugStmt, returnStmt], true);
        const updated = ts.factory.updateArrowFunction(
          node,
          node.modifiers,
          node.typeParameters,
          node.parameters,
          node.type,
          node.equalsGreaterThanToken,
          block,
        );

        transformedNode = updated;
        start = node.getStart(sourceFile);
        end = node.getEnd();
        return updated;
      }

      // 🟩 Empty Function Declaration
      if (
        ts.isFunctionDeclaration(node) &&
        node.body &&
        node.body.statements.length === 0 &&
        inRange &&
        node.parameters.some(
          (p) => ts.isIdentifier(p.name) && p.name.text === selectedVar,
        )
      ) {
        const block = ts.factory.createBlock([debugStmt], true);
        const updated = ts.factory.updateFunctionDeclaration(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          block,
        );

        transformedNode = updated;
        start = node.getStart(sourceFile);
        end = node.getEnd();
        return updated;
      }

      // 🆕 🟩 Empty Constructor Declaration
      if (
        ts.isConstructorDeclaration(node) &&
        node.body &&
        node.body.statements.length === 0 &&
        inRange &&
        node.parameters.some(
          (p) => ts.isIdentifier(p.name) && p.name.text === selectedVar,
        )
      ) {
        const block = ts.factory.createBlock([debugStmt], true);
        const updated = ts.factory.updateConstructorDeclaration(
          node,
          node.modifiers,
          node.parameters,
          block,
        );

        transformedNode = updated;
        start = node.getStart(sourceFile);
        end = node.getEnd();
        return updated;
      }

      return ts.visitEachChild(node, visit, ctx);
    };

    return (node) => ts.visitNode(node, visit) as ts.SourceFile;
  };

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  if (!transformedNode || start === -1 || end === -1) {
    result.dispose();
    return sourceCode; // No transformation applied
  }

  let printed = printer.printNode(
    ts.EmitHint.Unspecified,
    transformedNode,
    sourceFile,
  );

  // replace the placeholder manually (preserve indent)
  const lines = printed.split('\n');
  const patched = lines.map((l) => {
    const idx = l.indexOf(PLACEHOLDER);
    if (idx !== -1) {
      const indent = l.slice(0, idx);
      return indent + normalized;
    }
    return l;
  });

  printed = patched.join('\n');
  result.dispose();

  const finalCode =
    sourceCode.slice(0, start) + printed + sourceCode.slice(end);
  return finalCode;
}
