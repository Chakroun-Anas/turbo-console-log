import { describe } from 'mocha';
import nullishAssignmentTests from './assignment.test';

export default (): void => {
  describe('Nullish LOC assignment processing', () => {
    nullishAssignmentTests();
  });
};
