import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isIdentifier,
  isObjectPattern,
  isArrayPattern,
  isRestElement,
  isAssignmentPattern,
  walk,
} from '../../acorn-utils';

export function functionParameterChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  const wanted = variableName.trim();
  if (!wanted) return { isChecked: false };

  let match = false;

  if (!ast) {
    return { isChecked: false };
  }

  walk(ast, (node: AcornNode): boolean | void => {
    if (match) return true;

    // Check if this is a function with params
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      const params = (
        node as {
          params?: AcornNode[];
        }
      ).params;
      if (!params || !Array.isArray(params)) return;

      for (const param of params) {
        // Use start/end positions instead of loc
        if (param.start === undefined) continue;

        // For simple Identifier params, end might be undefined or incorrect
        // Calculate it from the identifier name length or use typeAnnotation.end
        let paramEnd = param.end;

        // Validate that end is after start (acorn-typescript bug with decorators can cause invalid end values)
        if (paramEnd === undefined || paramEnd <= param.start) {
          if (isIdentifier(param) && 'name' in param) {
            // Try to use typeAnnotation.end if available
            if (
              'typeAnnotation' in param &&
              param.typeAnnotation &&
              typeof param.typeAnnotation === 'object' &&
              'end' in param.typeAnnotation
            ) {
              paramEnd = (param.typeAnnotation as { end: number }).end;
            } else {
              // Fallback: calculate from identifier name length
              paramEnd = param.start + (param.name as string).length;
            }
          }
        }

        if (paramEnd === undefined || paramEnd <= param.start) continue;

        const startLine = document.positionAt(param.start).line;
        const endLine = document.positionAt(paramEnd).line;

        if (selectionLine >= startLine && selectionLine <= endLine) {
          if (paramContainsIdentifier(param, wanted, new Set(), 0)) {
            match = true;
            return true;
          }
        }
      }
    }
  });

  return {
    isChecked: match,
  };
}

/*──────────────── helper ────────────────*/

function paramContainsIdentifier(
  param: AcornNode,
  wanted: string,
  visited = new Set<AcornNode>(),
  depth = 0,
): boolean {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000; // Generous max depth for nested destructuring patterns

  if (depth >= MAX_DEPTH) {
    console.warn(
      `paramContainsIdentifier: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  if (visited.has(param)) {
    return false;
  }

  visited.add(param);

  // Handle rest parameters: ...numbers
  if (isRestElement(param)) {
    const restElem = param as { argument: AcornNode };
    return paramContainsIdentifier(
      restElem.argument,
      wanted,
      visited,
      depth + 1,
    );
  }

  // Handle assignment patterns (default values): x = 1
  if (isAssignmentPattern(param)) {
    const assignPat = param as { left: AcornNode };
    return paramContainsIdentifier(assignPat.left, wanted, visited, depth + 1);
  }

  // Simple identifier: name
  if (isIdentifier(param)) {
    return param.name === wanted;
  }

  // Object destructuring: { user, email } or { config: { apiKey } }
  if (isObjectPattern(param)) {
    const objPat = param as { properties: AcornNode[] };
    return objPat.properties.some((prop) => {
      if (prop.type === 'Property') {
        const property = prop as unknown as { value: AcornNode };
        // For { user }, prop.value is the identifier
        // For { config: { apiKey } }, prop.value is another ObjectPattern
        return paramContainsIdentifier(
          property.value,
          wanted,
          visited,
          depth + 1,
        );
      }
      // Handle RestElement in object patterns: { ...rest }
      if (prop.type === 'RestElement') {
        const restProp = prop as unknown as { argument: AcornNode };
        return paramContainsIdentifier(
          restProp.argument,
          wanted,
          visited,
          depth + 1,
        );
      }
      return false;
    });
  }

  // Array destructuring: [first, second] or [[id]]
  if (isArrayPattern(param)) {
    const arrPat = param as { elements: (AcornNode | null)[] };
    return arrPat.elements.some((el) => {
      // Skip holes in array patterns: [, second]
      if (!el) return false;
      return paramContainsIdentifier(el, wanted, visited, depth + 1);
    });
  }

  return false;
}
