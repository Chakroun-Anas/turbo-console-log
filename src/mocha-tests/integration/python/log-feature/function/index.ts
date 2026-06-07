import { describe } from 'mocha';
import functionParamTests from './functionParam';
import functionCallTests from './functionCall';

export default (): void => {
  describe('Function', () => {
    functionParamTests();
    functionCallTests();
  });
};
