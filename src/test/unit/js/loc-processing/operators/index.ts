import { describe } from 'mocha';
import ternaryLOCsTests from './ternary';
import nullishLOCsTests from './nullish';

export default (): void => {
  describe('Special Operators', () => {
    ternaryLOCsTests();
    nullishLOCsTests();
  });
};
