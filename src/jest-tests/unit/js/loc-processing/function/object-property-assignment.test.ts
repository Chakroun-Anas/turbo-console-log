import helpers from '../../helpers';

describe('Function Object Property Assignment', () => {
  it('Should return true if the LOC is an function object propety assignment', () => {
    const functionObjectPropAssignmentLOCs = [' myMethod: function() { }'];
    functionObjectPropAssignmentLOCs.forEach(
      (functionObjectPropAssignmentLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isFunctionAssignedToObjectProperty(
            functionObjectPropAssignmentLOC,
          ),
        ).toBe(true);
      },
    );
  });
});
