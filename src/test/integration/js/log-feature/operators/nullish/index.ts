import { describe } from 'mocha';

import assignmentTests from './assignment';
export default (): void => {
  describe('Nullish Operator', () => {
    assignmentTests();
  });
};
