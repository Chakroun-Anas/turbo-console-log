/**
 * Gets the enclosing class and function names for the selected variable.
 */

import { TextDocument } from 'vscode';
import { enclosingBlockName } from '../../../../enclosingBlockName';

/**
 * Gets the enclosing class and function names for the selected variable.
 * @param document The text document
 * @param lineOfSelectedVar The line number of the selected variable
 * @param insertEnclosingClass Whether to include the enclosing class name
 * @param insertEnclosingFunction Whether to include the enclosing function name
 * @returns Object containing className and functionName
 */
export function getEnclosingContext(
  document: TextDocument,
  lineOfSelectedVar: number,
  insertEnclosingClass: boolean,
  insertEnclosingFunction: boolean,
): { className: string; functionName: string } {
  let className = '';
  let functionName = '';

  if (insertEnclosingClass) {
    className = enclosingBlockName(document, lineOfSelectedVar, 'class');
  }

  if (insertEnclosingFunction) {
    functionName = enclosingBlockName(document, lineOfSelectedVar, 'function');
  }

  return { className, functionName };
}
