import { describe } from 'mocha';
import variableTests from './variable';
import functionTests from './function';
import objectTests from './object';
import arrayTests from './array';
import controlFlowTests from './controlFlow';
import asyncDefTests from './asyncDef';
import loggingCommandTests from './loggingCommand';

export default (): void => {
  describe('Insert log message feature', () => {
    variableTests();
    functionTests();
    objectTests();
    arrayTests();
    controlFlowTests();
    asyncDefTests();
    loggingCommandTests();
  });
};
