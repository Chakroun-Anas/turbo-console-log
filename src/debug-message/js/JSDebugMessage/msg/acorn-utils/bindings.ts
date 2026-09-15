import type { AcornNode, Identifier, VariableDeclaration } from './types';
import {
  isArrayPattern,
  isArrowFunctionExpression,
  isAssignmentPattern,
  isCatchClause,
  isClassMethod,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isObjectPattern,
  isProperty,
  isRestElement,
  isTSParameterProperty,
  isVariableDeclaration,
} from './guards';
import { walk } from './walk';

/**
 * The parameter nodes of a node that binds parameters: a function, arrow or
 * class method, or a `catch (err)` clause (its parameter only exists inside
 * the handler body, like a function parameter). Undefined for other nodes
 * and for a `catch {}` without a parameter.
 */
export function parameterList(node: AcornNode): AcornNode[] | undefined {
  if (isCatchClause(node)) return node.param ? [node.param] : undefined;
  if (
    isFunctionDeclaration(node) ||
    isFunctionExpression(node) ||
    isArrowFunctionExpression(node) ||
    isClassMethod(node)
  ) {
    return node.params;
  }
  return undefined;
}

/**
 * The identifiers a binding target declares: an identifier, a TypeScript
 * parameter property (`private readonly http: HttpClient`), or a destructuring
 * pattern at any depth (defaults, rest elements and array holes included).
 * Object keys are not bindings: `{ data: todos }` binds `todos`, not `data`.
 */
export function patternBindingIdentifiers(
  target: AcornNode | null | undefined,
): Identifier[] {
  if (!target) return [];
  if (isIdentifier(target)) return [target];
  if (isTSParameterProperty(target)) {
    return patternBindingIdentifiers(target.parameter);
  }
  if (isAssignmentPattern(target)) {
    return patternBindingIdentifiers(target.left);
  }
  if (isRestElement(target)) return patternBindingIdentifiers(target.argument);
  if (isArrayPattern(target)) {
    return target.elements.flatMap((element) =>
      patternBindingIdentifiers(element),
    );
  }
  if (isObjectPattern(target)) {
    // Runtime properties are Property or RestElement nodes.
    return (target.properties as AcornNode[]).flatMap((property) =>
      patternBindingIdentifiers(
        isProperty(property) ? property.value : property,
      ),
    );
  }
  return [];
}

/** Whether a binding target declares `name` (see patternBindingIdentifiers). */
export function patternBindsName(
  target: AcornNode | null,
  name: string,
): boolean {
  return patternBindingIdentifiers(target).some((id) => id.name === name);
}

/**
 * The variable declaration that binds `name` on the zero-based `selectionLine`.
 *
 * A declaration nested in a callback of an outer declaration covers the same
 * lines as the outer one (`const [a, b] = useState(() => { const item = … })`).
 * The declaration whose binding identifier sits on the selection line is the
 * one the selection belongs to. When several do (a same-named declaration
 * opening on the outer statement's first line), the outermost wins, since the
 * selection starts that statement. When none does, the smallest covering
 * declaration wins.
 */
export function findBindingDeclaration(
  ast: AcornNode,
  selectionLine: number,
  name: string,
): VariableDeclaration | undefined {
  const covering: VariableDeclaration[] = [];

  walk(ast, (node: AcornNode): void => {
    if (!isVariableDeclaration(node) || !node.loc) return;

    const startLine = node.loc.start.line - 1; // Acorn lines are 1-based
    const endLine = node.loc.end.line - 1;
    if (selectionLine < startLine || selectionLine > endLine) return;

    if (node.declarations.some((decl) => patternBindsName(decl.id, name))) {
      covering.push(node);
    }
  });

  const bindsOnSelectionLine = (declaration: VariableDeclaration): boolean =>
    declaration.declarations.some((decl) =>
      patternBindingIdentifiers(decl.id).some(
        (id) => id.name === name && id.loc?.start.line === selectionLine + 1, // Acorn lines are 1-based
      ),
    );

  return pickBySelectionLine(covering, bindsOnSelectionLine);
}

/**
 * Among nested statements covering the selection line, prefer those whose
 * binding or target sits on that line and take the outermost of them; with
 * none, take the smallest covering statement.
 */
export function pickBySelectionLine<T extends AcornNode>(
  covering: T[],
  isOnSelectionLine: (node: T) => boolean,
): T | undefined {
  const size = (node: T): number => node.end - node.start;
  const onLine = covering.filter(isOnSelectionLine);
  if (onLine.length > 0) {
    return onLine.reduce((outer, node) =>
      size(node) > size(outer) ? node : outer,
    );
  }
  return covering.reduce<T | undefined>(
    (inner, node) => (!inner || size(node) < size(inner) ? node : inner),
    undefined,
  );
}
