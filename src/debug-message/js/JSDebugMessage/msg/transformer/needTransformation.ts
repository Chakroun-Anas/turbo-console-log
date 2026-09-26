import { TextDocument } from 'vscode';
import { type AcornNode } from '../acorn-utils';
import { findTransformationTarget } from './helpers';

/**
 * Whether logging `selectedVar` on the zero-based `line` requires rewriting a
 * function body (see findTransformationTarget) instead of inserting a line.
 */
export function needTransformation(
  ast: AcornNode,
  document: TextDocument,
  line: number,
  selectedVar: string,
): boolean {
  if (!ast) return false;
  return (
    findTransformationTarget(ast, document, line, selectedVar) !== undefined
  );
}
