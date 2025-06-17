import { describe } from 'mocha';
import lineOfBlockClosingBraceTests from './lineOfBlockClosingBrace';
export default (): void => {
  describe('Core features', () => {
    lineOfBlockClosingBraceTests();
  });
};
