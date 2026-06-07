import { describe } from 'mocha';
import asyncFunctionParamTests from './asyncFunctionParam';

export default (): void => {
  describe('Async function', () => {
    asyncFunctionParamTests();
  });
};
