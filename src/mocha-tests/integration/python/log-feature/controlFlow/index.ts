import { describe } from 'mocha';
import forLoopTests from './forLoop';
import withBlockTests from './withBlock';
import exceptBlockTests from './exceptBlock';

export default (): void => {
  describe('Control flow', () => {
    forLoopTests();
    withBlockTests();
    exceptBlockTests();
  });
};
