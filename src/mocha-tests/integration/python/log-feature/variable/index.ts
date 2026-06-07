import { describe } from 'mocha';
import primitiveVariableTests from './primitiveVariable';
import variableInFunctionTests from './variableInFunction';

export default (): void => {
  describe('Variable', () => {
    primitiveVariableTests();
    variableInFunctionTests();
  });
};
