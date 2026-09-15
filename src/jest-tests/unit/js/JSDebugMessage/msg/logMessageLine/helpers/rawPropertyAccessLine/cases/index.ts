import case1 from './1';
import case2 from './2';
import case3 from './3';
import case5 from './5';
import case6 from './6';
import case7 from './7';
import case8 from './8';
import case9 from './9';
import case10 from './10';

export type RawPropertyAccessLineCase = {
  fileExtension: string;
  name: string;
  lines: string[];
  selectionLine: number;
  variableName: string;
  expectedLine: number;
  /**
   * Pins behaviour the engine does not honour yet: the case runs through
   * `it.failing`, so the suite stays green until the fix lands and then
   * reports "Failing test passed". Drop the flag together with the fix.
   */
  knownBroken?: boolean;
};

// NOTE: `./4` (Vue SFC) exists on disk but has never been wired up here.
const testCases: RawPropertyAccessLineCase[] = [
  case1,
  case2,
  case3,
  case5,
  case6,
  case7,
  case8,
  case9,
  case10,
];

export default testCases;
