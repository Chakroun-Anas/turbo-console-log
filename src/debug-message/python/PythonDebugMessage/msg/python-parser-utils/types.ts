import type { SyntaxNode, Tree } from '@lezer/common';

export type { SyntaxNode, Tree };

export interface PythonProgram {
  tree: Tree;
  lines: string[];
  /** Maps 0-based line number → character offset of line start */
  lineOffsets: number[];
}
