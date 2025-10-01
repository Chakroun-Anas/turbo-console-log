/**
 * Gets the enclosing class and function names for the selected variable.
 */

import { TextDocument } from 'vscode';
import { enclosingBlockName } from '../../../../enclosingBlockName';
import { findEnclosingBlocks } from '../../../../enclosingBlockName/findEnclosingBlocks';
import type { AcornNode } from '../../../acorn-utils';

/**
 * Gets the enclosing class and function names for the selected variable.
 * Optimized to find both class and function in a single AST traversal.
 * @param ast The pre-parsed AST (pass from msg.ts to avoid re-parsing)
 * @param document The text document
 * @param lineOfSelectedVar The line number of the selected variable
 * @param insertEnclosingClass Whether to include the enclosing class name
 * @param insertEnclosingFunction Whether to include the enclosing function name
 * @returns Object containing className and functionName
 */
export function getEnclosingContext(
  ast: AcornNode,
  document: TextDocument,
  lineOfSelectedVar: number,
  insertEnclosingClass: boolean,
  insertEnclosingFunction: boolean,
): { className: string; functionName: string } {
  // Early exit if neither is needed
  if (!insertEnclosingClass && !insertEnclosingFunction) {
    return { className: '', functionName: '' };
  }

  // If only one is needed, use the optimized single-block function
  if (!insertEnclosingClass) {
    return {
      className: '',
      functionName: enclosingBlockName(
        ast,
        document,
        lineOfSelectedVar,
        'function',
      ),
    };
  }

  if (!insertEnclosingFunction) {
    return {
      className: enclosingBlockName(ast, document, lineOfSelectedVar, 'class'),
      functionName: '',
    };
  }

  // If both are needed, find them in a SINGLE traversal (most efficient!)
  return findEnclosingBlocks(ast, document, lineOfSelectedVar);
}
