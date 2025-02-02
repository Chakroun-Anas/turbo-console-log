import { describe } from 'mocha';
import variableAssignmentTests from './assignment.test';

export default (): void => {
  describe('Variables LOC processing', () => {
    variableAssignmentTests();
  });
};
