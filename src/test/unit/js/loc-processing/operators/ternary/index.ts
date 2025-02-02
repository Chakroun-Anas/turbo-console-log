import { describe } from 'mocha';
import ternaryAssignmentTests from './assignment.test';

export default (): void => {
  describe('Ternary LOC assignment processing', () => {
    ternaryAssignmentTests();
  });
};
