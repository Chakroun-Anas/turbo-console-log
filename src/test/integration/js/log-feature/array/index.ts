import { describe } from 'mocha';

import arrayAssignmentTests from './assignment';
export default (): void => {
  describe('Array Context', () => {
    arrayAssignmentTests();
  });
};
