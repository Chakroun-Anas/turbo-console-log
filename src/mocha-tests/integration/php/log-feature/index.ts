import { describe } from 'mocha';
import variableTests from './variable';
import functionTests from './function';
import classTests from './class';
import objectTests from './object';
import arrayTests from './array';

export default (): void => {
  describe('Insert log message feature', () => {
    variableTests();
    functionTests();
    classTests();
    objectTests();
    arrayTests();
  });
};
