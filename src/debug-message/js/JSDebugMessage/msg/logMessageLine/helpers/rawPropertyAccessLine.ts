import { TextDocument, Position } from 'vscode';
import {
  findObjectLiteralKey,
  ifBodyFirstLine,
  isInStatementHead,
  isProperty,
  isVariableDeclaration,
  statementLines,
  walk,
  type AcornNode,
  type ObjectLiteralKey,
  type VariableDeclaration,
} from '../../acorn-utils';

export function rawPropertyAccessLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(variableName);
  if (charIndex === -1) return selectionLine + 1;

  const offsetStart = document.offsetAt(new Position(selectionLine, charIndex));
  const offsetEnd = offsetStart + variableName.length;

  const objectKey = findObjectLiteralKey(
    ast,
    offsetStart,
    offsetEnd,
    variableName,
  );
  const keyLine = objectKey && objectKeyLine(ast, document, objectKey);
  if (keyLine !== undefined) return keyLine;

  return containingDeclarationLine(
    ast,
    document,
    selectionLine,
    offsetStart,
    offsetEnd,
  );
}

/**
 * Where a selected object-literal key is logged:
 * - declared root (`const config = { … }`): after the declaration
 * - member-assigned root (`this.state = { … };`): after the statement
 * - no root (returned, argument, `export default`): the value is logged
 *   before the enclosing statement, where it is reachable and in scope. For
 *   an else-if condition, at the top of the else-if body (else-if decision).
 *   "Before" climbs out of braceless bodies and same-line `case`/`else`
 *   headers (statementLines).
 */
function objectKeyLine(
  ast: AcornNode,
  document: TextDocument,
  key: ObjectLiteralKey,
): number | undefined {
  const { root, enclosing, literal } = key;
  switch (root.kind) {
    case 'declaration':
      return document.positionAt(root.declaration.end).line + 1;
    case 'assignment':
      return document.positionAt(root.statement.end).line + 1;
    case 'none': {
      if (!enclosing) return undefined;
      const { statement, isElseIf } = enclosing;
      const bodyLine =
        isElseIf && isInStatementHead(statement, literal)
          ? ifBodyFirstLine(statement)
          : undefined;
      if (bodyLine !== undefined) return bodyLine;
      const { before, after } = statementLines(ast, document, statement);
      return before ?? after;
    }
  }
}

/**
 * Fallback for property accesses (and keys with no statement in their function
 * scope): after the variable declaration that contains the property.
 */
function containingDeclarationLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  offsetStart: number,
  offsetEnd: number,
): number {
  let foundProperty: AcornNode | undefined;

  // First, find the Property node at the selection
  walk(ast, (node: AcornNode): boolean | void => {
    if (
      node.start <= offsetStart &&
      node.end >= offsetEnd &&
      isProperty(node) &&
      !foundProperty
    ) {
      foundProperty = node;
      return true; // Stop early once found
    }
  });

  if (!foundProperty) {
    return selectionLine + 1;
  }

  // Now find the VariableDeclaration that contains this property
  let containingVarDecl: VariableDeclaration | undefined;
  const propertyStart = foundProperty.start;
  const propertyEnd = foundProperty.end;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isVariableDeclaration(node)) {
      const varDecl = node as VariableDeclaration;
      // Check if the property is within this variable declaration's range
      if (varDecl.start <= propertyStart && varDecl.end >= propertyEnd) {
        containingVarDecl = varDecl;
        return true; // Stop early
      }
    }
  });

  if (containingVarDecl) {
    const endPos = document.positionAt(containingVarDecl.end);
    return endPos.line + 1;
  }

  return selectionLine + 1;
}
