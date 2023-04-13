import { describe } from 'mocha';
import objectAssignmentTest from './assignment.test';

export default (): void => {
  describe('Object LOC processing', () => {
    objectAssignmentTest();
  });
};
