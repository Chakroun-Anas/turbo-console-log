import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Function Object Property Assignment', () => {
    it('Should return true if the LOC is an function object propety assignment', () => {
      const functionObjectPropAssignmentLOCs = [' myMethod: function() { }'];
      functionObjectPropAssignmentLOCs.forEach(
        (functionObjectPropAssignmentLOC) => {
          expect(
            helpers.jsLineCodeProcessing.isFunctionAssignedToObjectProperty(
              functionObjectPropAssignmentLOC,
            ),
          ).to.equal(true);
        },
      );
    });
  });
};
