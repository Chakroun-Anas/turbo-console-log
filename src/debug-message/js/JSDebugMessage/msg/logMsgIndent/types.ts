import type { SourceLocation } from 'acorn';
import type { AcornNode } from '../acorn-utils/types';

/** What only the insert command knows: the parsed file and the tab size. */
export type LogInsertion = { ast: AcornNode; tabSize: number };

/** A node holding a list of statements between braces, with its location. */
export interface BlockNode extends AcornNode {
  type: 'BlockStatement' | 'StaticBlock' | 'TSModuleBlock';
  body: AcornNode[];
  loc: SourceLocation;
}
