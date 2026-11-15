import type { Block, Location, Program } from '../php-parser-utils/types';

/** What only the insert command knows: the parsed file and the tab size. */
export type LogInsertion = { ast: Program; tabSize: number };

/** A block of statements, with its location. */
export interface BlockNode extends Block {
  loc: Location;
}
