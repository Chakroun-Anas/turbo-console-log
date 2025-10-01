import { Position, TextDocument } from 'vscode';
import { LogContextMetadata } from '@/entities';
import {
  type AcornNode,
  type Property,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  walk,
} from '../../acorn-utils';

/**
 * Helper to get text from source code at node position
 */
function getNodeText(node: AcornNode, sourceCode: string): string {
  if (node.start !== undefined && node.end !== undefined) {
    return sourceCode.substring(node.start, node.end);
  }
  return '';
}

export function rawPropertyAccessChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
) {
  // Find the selection in the line
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(selectedText);
  if (charIndex === -1) {
    return { isChecked: false };
  }
  const startOffset = document.offsetAt(new Position(selectionLine, charIndex));
  const endOffset = startOffset + selectedText.length;

  const sourceCode = document.getText();

  if (!ast) {
    return { isChecked: false };
  }

  // Build a parent map by walking the tree once
  const parentMap = new Map<AcornNode, AcornNode>();

  walk(ast, (node: AcornNode) => {
    // For each node, store parent references for its direct children
    if (node.type === 'Property') {
      const prop = node as Property;
      if (prop.key) parentMap.set(prop.key, node);
      if (prop.value) parentMap.set(prop.value, node);
    } else if (node.type === 'MemberExpression') {
      const member = node as { object?: AcornNode; property?: AcornNode };
      if (member.object) parentMap.set(member.object, node);
      if (member.property) parentMap.set(member.property, node);
    } else if (node.type === 'ObjectExpression') {
      const obj = node as { properties?: AcornNode[] };
      if (obj.properties) {
        obj.properties.forEach((prop) => parentMap.set(prop, node));
      }
    } else if (node.type === 'ObjectPattern') {
      // Destructuring pattern: const { fullName } = person;
      const objPattern = node as { properties?: AcornNode[] };
      if (objPattern.properties) {
        objPattern.properties.forEach((prop) => parentMap.set(prop, node));
      }
    } else if (node.type === 'VariableDeclaration') {
      const varDecl = node as { declarations?: AcornNode[] };
      if (varDecl.declarations) {
        varDecl.declarations.forEach((decl) => parentMap.set(decl, node));
      }
    } else if (node.type === 'VariableDeclarator') {
      const varDeclarator = node as { id?: AcornNode; init?: AcornNode };
      if (varDeclarator.id) parentMap.set(varDeclarator.id, node);
      if (varDeclarator.init) parentMap.set(varDeclarator.init, node);
    }
  });

  // Locate the matching node
  let matchedNode: AcornNode | undefined;

  walk(ast, (node: AcornNode): boolean | void => {
    if (matchedNode) return true;

    // 1) Property assignment: e.g., `mother: {...}` or `age: 28`
    //    BUT NOT destructuring patterns like `const { fullName } = person;`
    if (node.type === 'Property') {
      const prop = node as Property;
      const key = prop.key;

      if (
        isIdentifier(key) &&
        key.name === selectedText &&
        key.start !== undefined &&
        key.end !== undefined &&
        key.start <= startOffset &&
        key.end >= endOffset
      ) {
        // Check if this Property is inside an ObjectPattern (destructuring)
        // by checking if the parent is an ObjectPattern
        const parent = parentMap.get(node);
        if (parent && parent.type === 'ObjectPattern') {
          // This is a destructuring pattern, not a property access
          return;
        }

        matchedNode = node;
        return true;
      }
    }

    // 2) Property access: e.g., `person.family.mother`
    // BUT NOT this.property access
    if (isMemberExpression(node)) {
      const property = (node as { property?: AcornNode }).property;
      const object = (node as { object?: AcornNode }).object;

      // // Skip this.property cases - they're not raw property access
      if (object && object.type === 'ThisExpression') {
        return;
      }

      if (
        property &&
        isIdentifier(property) &&
        property.name === selectedText &&
        node.start !== undefined &&
        node.end !== undefined &&
        node.start <= startOffset &&
        node.end >= endOffset
      ) {
        matchedNode = node;
        return true;
      }
    }

    // 3) Element access: e.g., `person['age']`
    if (
      node.type === 'MemberExpression' &&
      (node as { computed?: boolean }).computed
    ) {
      const property = (node as { property?: AcornNode }).property;

      if (property) {
        const propText = getNodeText(property, sourceCode).replace(
          /^['"]|['"]$/g,
          '',
        );

        if (
          propText === selectedText &&
          node.start !== undefined &&
          node.end !== undefined &&
          node.start <= startOffset &&
          node.end >= endOffset
        ) {
          matchedNode = node;
          return true;
        }
      }
    }
  });

  if (!matchedNode) {
    return { isChecked: false };
  }

  // Build the full path: climb up through assignments → object literals → var decl
  const pathParts: string[] = [];
  let current: AcornNode | undefined = matchedNode;

  // Safeguards against infinite loops
  const visited = new Set<AcornNode>();
  const MAX_DEPTH = 1000; // Generous max depth for deeply nested objects
  let depth = 0;

  while (current && depth < MAX_DEPTH && !visited.has(current)) {
    visited.add(current);
    depth++;
    if (isMemberExpression(current)) {
      const property = (current as { property?: AcornNode }).property;
      if (property && isIdentifier(property)) {
        pathParts.unshift(property.name);
      }
      const memberExpr = current as { object?: AcornNode };
      current = memberExpr.object;
    } else if (
      current.type === 'MemberExpression' &&
      (current as { computed?: boolean }).computed
    ) {
      // Element access
      const property = (current as { property?: AcornNode }).property;
      if (property) {
        const propText = getNodeText(property, sourceCode);
        const arg = propText.slice(1, -1); // strip quotes
        pathParts.unshift(arg);
      }
      const memberExpr = current as { object?: AcornNode };
      current = memberExpr.object;
    } else if (current.type === 'Property') {
      const prop = current as Property;
      const key = prop.key;

      if (isIdentifier(key)) {
        pathParts.unshift(key.name);
      } else if (key.type === 'Literal') {
        const value = (key as { value?: string | number }).value;
        pathParts.unshift(String(value));
      } else {
        pathParts.unshift(getNodeText(key, sourceCode));
      }

      current = parentMap.get(current); // Move up to ObjectExpression
    } else if (isObjectExpression(current)) {
      current = parentMap.get(current); // Move to next Property or VariableDeclarator
    } else if (current.type === 'VariableDeclarator') {
      const id = (current as { id?: AcornNode }).id;
      if (id && isIdentifier(id)) {
        pathParts.unshift(id.name);
      }
      break;
    } else {
      current = parentMap.get(current); // Climb up the tree
    }
  }

  // Log safety limit hits for debugging
  if (depth >= MAX_DEPTH) {
    console.warn(
      `rawPropertyAccessChecker: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
    );
  }

  return {
    isChecked: true,
    metadata: {
      deepObjectPath: pathParts.join('.'),
    } as LogContextMetadata,
  };
}
