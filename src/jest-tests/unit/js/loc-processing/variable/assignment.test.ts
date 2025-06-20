import helpers from '../../helpers';

describe('Assignment to a variable', () => {
  it('Should return true if ', () => {
    const assignmentsLOCs = [
      'const menuElement = menuRef.current',
      '    const menuElement = menuRef.current;',
    ];
    assignmentsLOCs.forEach((assignmentLOC) => {
      expect(
        helpers.jsLineCodeProcessing.isAssignedToVariable(assignmentLOC),
      ).toBe(true);
    });
  });
});
