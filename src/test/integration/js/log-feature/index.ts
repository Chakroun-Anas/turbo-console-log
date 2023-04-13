import { describe } from 'mocha';
import classContextTests from './class';
import functionContextTests from './function';
import objectContextTests from './object';
import variableTests from './variable';

export default (): void => {
  describe('Insert log message feature', () => {
    variableTests();
    classContextTests();
    functionContextTests();
    objectContextTests();
  });
};
