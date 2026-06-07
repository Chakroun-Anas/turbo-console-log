/**
 * Helpers for ensuring `import logging` exists when a `logging.*` log is inserted.
 *
 * `print` is a builtin, but `logging.debug/info/warning/error` need the module
 * imported or they raise NameError at runtime. JS/PHP don't need this (their log
 * functions are global), so this is Python-specific.
 */
import type { TextDocument } from 'vscode';
import type { SyntaxNode } from '@lezer/common';
import type { PythonProgram } from '../python-parser-utils/types';
import { offsetToLine } from '../python-parser-utils/walk';

/**
 * True when the bare module name `logging` is bound by a top-level import.
 *
 * Only `import logging`, `import logging.x`, `import a, logging` bind the name.
 * `from logging import …` imports names *from* the module (doesn't bind it), and
 * `import logging as x` binds the alias — both return false, so the caller still
 * adds `import logging` (redundant but harmless rather than a NameError).
 */
export function isLoggingModuleImported(
  program: PythonProgram,
  document: TextDocument,
): boolean {
  const text = document.getText();
  let stmt: SyntaxNode | null = program.tree.topNode.firstChild;
  while (stmt) {
    if (stmt.type.name === 'ImportStatement' && importBindsLogging(stmt, text)) {
      return true;
    }
    stmt = stmt.nextSibling;
  }
  return false;
}

function importBindsLogging(stmt: SyntaxNode, text: string): boolean {
  // `from … import …` does not bind the module name.
  if (stmt.firstChild?.type.name !== 'import') return false;

  let child: SyntaxNode | null = stmt.firstChild;
  while (child) {
    const prev = child.prevSibling?.type.name;
    const isClauseHead =
      child.type.name === 'VariableName' &&
      (prev === 'import' || prev === ',');
    if (isClauseHead && text.slice(child.from, child.to) === 'logging') {
      // This clause binds `logging` only if it isn't aliased (`as x`).
      let aliased = false;
      let n: SyntaxNode | null = child.nextSibling;
      while (n && n.type.name !== ',') {
        if (n.type.name === 'as') {
          aliased = true;
          break;
        }
        n = n.nextSibling;
      }
      if (!aliased) return true;
    }
    child = child.nextSibling;
  }
  return false;
}

/**
 * The 0-based line at which to insert `import logging`: after a leading
 * shebang/encoding comment, the module docstring, and any `from __future__`
 * imports (which must stay the first statements), and before the first real
 * statement. Returns `document.lineCount` when the file is empty or contains
 * only a docstring/`__future__` prologue (insert at end).
 */
export function loggingImportInsertLine(
  program: PythonProgram,
  document: TextDocument,
): number {
  const text = document.getText();
  let stmt: SyntaxNode | null = program.tree.topNode.firstChild;
  let nonCommentIndex = 0;
  while (stmt) {
    // Leading comments (shebang, encoding) are real nodes in Lezer — skip them
    // so the import lands after them, not before.
    if (stmt.type.name === 'Comment') {
      stmt = stmt.nextSibling;
      continue;
    }
    const isDocstring = nonCommentIndex === 0 && isModuleDocstring(stmt);
    const isFuture = isFutureImport(stmt, text);
    if (!isDocstring && !isFuture) {
      return offsetToLine(program, stmt.from);
    }
    nonCommentIndex += 1;
    stmt = stmt.nextSibling;
  }
  return document.lineCount;
}

function isModuleDocstring(stmt: SyntaxNode): boolean {
  return (
    stmt.type.name === 'ExpressionStatement' &&
    stmt.firstChild?.type.name === 'String'
  );
}

function isFutureImport(stmt: SyntaxNode, text: string): boolean {
  if (stmt.type.name !== 'ImportStatement') return false;
  if (stmt.firstChild?.type.name !== 'from') return false;
  const moduleName = stmt.firstChild.nextSibling;
  return (
    !!moduleName &&
    moduleName.type.name === 'VariableName' &&
    text.slice(moduleName.from, moduleName.to) === '__future__'
  );
}
