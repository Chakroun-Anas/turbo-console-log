import { describe } from 'mocha';

import ternaryTests from './ternary';
import nullishTests from './nullish';
export default (): void => {
  describe('Special Operators', () => {
    ternaryTests();
    nullishTests();
  });
};
