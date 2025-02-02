import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Assignment to a variable', () => {
    it('Should return true if ', () => {
      const assignmentsLOCs = [
        'const menuElement = menuRef.current',
        '    const menuElement = menuRef.current;',
      ];
      assignmentsLOCs.forEach((assignmentLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isAssignedToVariable(assignmentLOC),
        ).to.equal(true);
      });
    });
  });
};
