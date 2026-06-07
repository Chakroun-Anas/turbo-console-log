/**
 * Walks the Lezer Python AST upward from the selection line to find the
 * nearest enclosing function and/or class, returning their names.
 *
 * Mirrors getEnclosingContext from the JS implementation but uses the
 * @lezer/python AST instead of Acorn.
 */
import type { TextDocument } from 'vscode';
import type { PythonProgram } from '../../../python-parser-utils/types';
import {
  resolveNodeAtLine,
  findAncestor,
  findChild,
} from '../../../python-parser-utils/walk';
import {
  isFunctionDefinition,
  isClassDefinition,
} from '../../../python-parser-utils/guards';

export function getEnclosingContext(
  program: PythonProgram,
  document: TextDocument,
  lineOfSelectedVar: number,
  insertEnclosingClass: boolean,
  insertEnclosingFunction: boolean,
): { className: string; functionName: string } {
  const text = document.getText();
  const node = resolveNodeAtLine(program, lineOfSelectedVar);

  let functionName = '';
  let className = '';

  if (insertEnclosingFunction) {
    const funcDef = findAncestor(node, isFunctionDefinition);
    if (funcDef) {
      // The name is the first VariableName child. Read it via findChild rather
      // than `firstChild.nextSibling`, because `async def` puts the `async`
      // keyword first, which would otherwise shift the lookup onto `def`.
      const nameNode = findChild(funcDef, 'VariableName');
      if (nameNode) {
        functionName = text.slice(nameNode.from, nameNode.to);
      }
    }
  }

  if (insertEnclosingClass) {
    const classDef = findAncestor(node, isClassDefinition);
    if (classDef) {
      // The class name is the first VariableName child (class  VariableName  …).
      const nameNode = findChild(classDef, 'VariableName');
      if (nameNode) {
        className = text.slice(nameNode.from, nameNode.to);
      }
    }
  }

  return { className, functionName };
}
