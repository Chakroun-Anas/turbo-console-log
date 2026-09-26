import { Position, TextDocument } from 'vscode';
import { LogContextMetadata } from '@/entities';
import {
  type AcornNode,
  type ObjectLiteralKey,
  type Property,
  findObjectLiteralKey,
  isIdentifier,
  isMemberExpression,
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
): RawPropertyAccessCheck {
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

  // 1) Object literal key: e.g., `mother: {...}` or `age: 28`
  //    (destructuring patterns like `const { fullName } = person;` never match)
  const objectKey = findObjectLiteralKey(
    ast,
    startOffset,
    endOffset,
    selectedText,
  );
  if (objectKey) {
    return checked(objectKeyPath(objectKey, sourceCode));
  }

  const access = findPropertyAccess(
    ast,
    startOffset,
    endOffset,
    selectedText,
    sourceCode,
  );
  return access ? checked(memberAccessPath(access)) : { isChecked: false };
}

type RawPropertyAccessCheck = {
  isChecked: boolean;
  metadata?: LogContextMetadata;
};

function checked(deepObjectPath: string): RawPropertyAccessCheck {
  return {
    isChecked: true,
    metadata: { deepObjectPath } as LogContextMetadata,
  };
}

/**
 * The expression that reads the selected key:
 * - a declared root: `person.family.mother`
 * - a member-assigned root: `this.state.ready`, `module.exports.a`
 * - no root: a key is not a binding, so the property's value is logged
 *   (`id: user.id` logs `user.id`). A value that cannot be logged again
 *   (`stamp: now()`) is replaced by the key name as a string: the bare key
 *   would be an undeclared identifier and throw a ReferenceError at runtime.
 */
function objectKeyPath(key: ObjectLiteralKey, sourceCode: string): string {
  const keyNames = key.keyPath.map((property) => keyName(property, sourceCode));
  switch (key.root.kind) {
    case 'declaration':
      return [key.root.name, ...keyNames].join('.');
    case 'assignment':
      return [getNodeText(key.root.target, sourceCode), ...keyNames].join('.');
    case 'none':
      return (
        loggableValue(key.property, sourceCode) ??
        JSON.stringify(keyNames[keyNames.length - 1])
      );
  }
}

function keyName(property: Property, sourceCode: string): string {
  const { key } = property;
  if (isIdentifier(key)) return key.name;
  if (key.type === 'Literal') {
    return String((key as { value?: string | number }).value);
  }
  return getNodeText(key, sourceCode);
}

/**
 * Types whose evaluation has side effects: logging a value that contains one
 * would run it a second time (`id: nextId()`).
 */
const SIDE_EFFECT_TYPES = new Set([
  'CallExpression',
  'NewExpression',
  'ImportExpression',
  'TaggedTemplateExpression',
  'AwaitExpression',
  'YieldExpression',
  'UpdateExpression',
  'AssignmentExpression',
]);

/**
 * The value's source when it can be logged as is: an expression that is not a
 * function and does not re-run side effects. A multi-line value is joined onto
 * one line (the log label repeats it) unless it holds a template literal or a
 * comment, whose content a join would change. Undefined otherwise.
 */
function loggableValue(
  property: Property,
  sourceCode: string,
): string | undefined {
  const { value } = property;
  if (property.method || property.kind !== 'init') return undefined;

  const text = getNodeText(value, sourceCode);
  if (!text) return undefined;

  let loggable = true;
  let hasTemplate = false;
  walk(value, (node: AcornNode): boolean | void => {
    if (node.type === 'TemplateLiteral') hasTemplate = true;
    if (
      SIDE_EFFECT_TYPES.has(node.type) ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'ClassExpression' ||
      (node.type === 'UnaryExpression' &&
        (node as { operator?: string }).operator === 'delete')
    ) {
      loggable = false;
    }
    return !loggable;
  });
  if (!loggable) return undefined;
  if (!text.includes('\n')) return text;
  if (hasTemplate || /\/[/*]|\\\r?\n/.test(text)) return undefined;
  return text.replace(/\s*\r?\n\s*/g, ' ');
}

/**
 * Property access matching the selection: `person.family.mother` or
 * `person['age']` (but not `this.property`).
 */
function findPropertyAccess(
  ast: AcornNode,
  startOffset: number,
  endOffset: number,
  selectedText: string,
  sourceCode: string,
): AcornNode | undefined {
  let matchedNode: AcornNode | undefined;

  walk(ast, (node: AcornNode): boolean | void => {
    if (matchedNode) return true;
    if (!isMemberExpression(node)) return;
    if (node.start > startOffset || node.end < endOffset) return;

    const { object, property } = node;
    // Skip this.property cases - they're not raw property access
    if (object.type === 'ThisExpression') return;

    // 2) Property access: e.g., `person.family.mother`
    if (isIdentifier(property) && property.name === selectedText) {
      matchedNode = node;
      return true;
    }

    // 3) Element access: e.g., `person['age']`
    if (node.computed) {
      const propText = getNodeText(property, sourceCode).replace(
        /^['"]|['"]$/g,
        '',
      );
      if (propText === selectedText) {
        matchedNode = node;
        return true;
      }
    }
  });

  return matchedNode;
}

/**
 * The dotted identifier properties of a member chain, from the matched access
 * down: `person.family.mother` yields `family.mother`.
 */
function memberAccessPath(node: AcornNode): string {
  const pathParts: string[] = [];
  let current: AcornNode = node;
  while (isMemberExpression(current)) {
    if (isIdentifier(current.property)) {
      pathParts.unshift(current.property.name);
    }
    current = current.object;
  }
  return pathParts.join('.');
}
