import { TextDocument } from 'vscode';
import {
  isArrowFunctionExpression,
  isBlockStatement,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isObjectExpression,
  isProperty,
  patternBindingIdentifiers,
  type AcornNode,
  type ArrowFunctionExpression,
  type BlockStatement,
  type FunctionDeclaration,
  type FunctionExpression,
} from '../../acorn-utils';

export type TransformableFunction =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression;

// Undefined owner: the occurrence sits outside any function.
type Owner = TransformableFunction | undefined;

type Occurrences = {
  /** Functions binding the name through a parameter on the selection line. */
  parameterOwners: TransformableFunction[];
  /** Innermost function around each variable reference on the line. */
  referenceOwners: Owner[];
  /** Innermost function around each object-literal key on the line. */
  keyOwners: Owner[];
};

// Position data and TypeScript types never hold runtime references.
const IGNORED_KEYS = new Set([
  'type',
  'start',
  'end',
  'loc',
  'range',
  'parent',
  'typeAnnotation',
  'returnType',
  'typeParameters',
  'typeArguments',
  'superTypeParameters',
]);

/**
 * The function whose body the transformer rewrites to log `selectedVar` on the
 * zero-based `line`, or undefined when a plain line insertion is enough.
 *
 * Only a function that owns the selection qualifies, so a same-line arrow that
 * merely mentions the name as a member property (`state.auth.user`), an object
 * key (`{ status: v }`) or inside a nested function is left alone:
 * - a parameter binding the name on that line wins: its function is rewritten
 *   when its body has no line of its own to receive the log (an expression
 *   body, or a block whose content or closing brace sits on the brace line);
 * - otherwise a reference whose innermost function is an expression-bodied
 *   arrow gets that arrow rewritten;
 * - an object-literal key only counts when the name has no other occurrence on
 *   the line (`(u) => ({ id: u.id })`): the key is then the selection itself.
 */
export function findTransformationTarget(
  ast: AcornNode,
  document: TextDocument,
  line: number,
  selectedVar: string,
): TransformableFunction | undefined {
  // `item.label`, `item?.label` and `item[0]` all resolve through `item`.
  const name = selectedVar.trim().match(/^[A-Za-z_$][\w$]*/)?.[0];
  if (!name) return undefined;

  const { parameterOwners, referenceOwners, keyOwners } = collectOccurrences(
    ast,
    name,
    (node) => document.positionAt(node.start).line === line,
  );

  const parameterOwner = smallest(parameterOwners);
  if (parameterOwner) {
    return hasExpressionBody(parameterOwner) ||
      hasContentOnBraceLine(parameterOwner, document)
      ? parameterOwner
      : undefined;
  }
  const owners = referenceOwners.length > 0 ? referenceOwners : keyOwners;
  return smallest(
    owners.filter(
      (owner): owner is TransformableFunction =>
        owner !== undefined && hasExpressionBody(owner),
    ),
  );
}

function collectOccurrences(
  ast: AcornNode,
  name: string,
  isOnLine: (node: AcornNode) => boolean,
): Occurrences {
  const occurrences: Occurrences = {
    parameterOwners: [],
    referenceOwners: [],
    keyOwners: [],
  };
  const parameterBindings = new Set<AcornNode>();

  const isSelectedName = (node: AcornNode): boolean =>
    isIdentifier(node) && node.name === name && isOnLine(node);

  const visit = (node: AcornNode, owner?: TransformableFunction): void => {
    if (isFunctionNode(node)) {
      for (const param of node.params) {
        for (const id of patternBindingIdentifiers(param)) {
          parameterBindings.add(id);
          if (id.name === name && isOnLine(id)) {
            occurrences.parameterOwners.push(node);
          }
        }
      }
      owner = node;
    } else if (isIdentifier(node)) {
      if (!parameterBindings.has(node) && isSelectedName(node)) {
        occurrences.referenceOwners.push(owner);
      }
      return;
    } else if (isObjectExpression(node)) {
      for (const property of node.properties) {
        if (isProperty(property) && !property.computed) {
          if (isSelectedName(property.key)) occurrences.keyOwners.push(owner);
        }
      }
    }
    for (const child of referenceChildren(node)) visit(child, owner);
  };

  visit(ast);
  return occurrences;
}

function referenceChildren(node: AcornNode): AcornNode[] {
  const nameKeys = nonReferenceNameKeys(node);
  const fields = node as unknown as Record<string, unknown>;

  return Object.keys(fields)
    .filter((key) => !IGNORED_KEYS.has(key) && !nameKeys.includes(key))
    .flatMap((key) => {
      const value = fields[key];
      return (Array.isArray(value) ? value : [value]).filter(isAstNode);
    });
}

// Identifiers that name something rather than reference a variable:
// `obj.name`, `{ name: value }`, `name() {}`, `name = 1` in a class, labels.
function nonReferenceNameKeys(node: AcornNode): string[] {
  const { computed } = node as { computed?: boolean };
  switch (node.type) {
    case 'MemberExpression':
      return computed ? [] : ['property'];
    case 'Property':
    case 'MethodDefinition':
    case 'PropertyDefinition':
      return computed ? [] : ['key'];
    case 'LabeledStatement':
    case 'BreakStatement':
    case 'ContinueStatement':
      return ['label'];
    case 'MetaProperty':
      return ['meta', 'property'];
    default:
      return [];
  }
}

function isAstNode(value: unknown): value is AcornNode {
  return typeof value === 'object' && value !== null && 'type' in value;
}

function isFunctionNode(node: AcornNode): node is TransformableFunction {
  return (
    isFunctionDeclaration(node) ||
    isFunctionExpression(node) ||
    isArrowFunctionExpression(node)
  );
}

function hasExpressionBody(fn: TransformableFunction): boolean {
  return isArrowFunctionExpression(fn) && !isBlockStatement(fn.body);
}

/**
 * Whether the first statement of a block body, or its closing brace when it is
 * empty, sits on the line of its opening brace: `{}`, `{ return value; }`.
 */
function hasContentOnBraceLine(
  fn: TransformableFunction,
  document: TextDocument,
): boolean {
  if (!fn.body || !isBlockStatement(fn.body)) return false;
  const body: BlockStatement = fn.body;
  const firstContent = body.body[0]?.start ?? body.end - 1;
  return (
    document.positionAt(firstContent).line ===
    document.positionAt(body.start).line
  );
}

function smallest(
  functions: TransformableFunction[],
): TransformableFunction | undefined {
  return functions.reduce<TransformableFunction | undefined>(
    (best, fn) =>
      !best || fn.end - fn.start < best.end - best.start ? fn : best,
    undefined,
  );
}
