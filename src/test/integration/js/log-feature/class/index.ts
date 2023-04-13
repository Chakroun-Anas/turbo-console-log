import { describe } from 'mocha';

import classConstructorTest from './classConstructor';
import classFunctionTest from './classFunction';
import classNestedFunctionsTest from './classNestedFunctions';

export default (): void => {
  describe('Class Context', () => {
    classConstructorTest();
    classFunctionTest();
    classNestedFunctionsTest();
  });
};
