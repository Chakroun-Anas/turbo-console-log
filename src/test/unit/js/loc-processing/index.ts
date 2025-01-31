import { describe } from 'mocha';
import functionTests from './function';
import classTests from './class';
import arrayTests from './array';
import objectTests from './object';
import assignmentTests from './variable';

export default (): void => {
  describe('JS LOC processing', () => {
    objectTests();
    arrayTests();
    classTests();
    functionTests();
    assignmentTests();
  });
};
