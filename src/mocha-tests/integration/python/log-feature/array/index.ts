import { describe } from 'mocha';
import arrayAccessTests from './arrayAccess';

export default (): void => {
  describe('Array', () => {
    arrayAccessTests();
  });
};
