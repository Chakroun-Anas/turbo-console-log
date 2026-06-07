import { describe } from 'mocha';
import methodCallTests from './methodCall';
import propertyAccessTests from './propertyAccess';

export default (): void => {
  describe('Object', () => {
    methodCallTests();
    propertyAccessTests();
  });
};
