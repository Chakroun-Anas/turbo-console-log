import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../../helpers';

export default (): void => {
  describe('Ternary operator assignment', () => {
    it('Should return true for ternary assignment LOCs', () => {
      const ternaryAssignmentLOCs = [`const foo = 1 + 1 === 2 ? 'bar': 'baz';`];
      ternaryAssignmentLOCs.forEach((ternaryAssignmentLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isTernaryExpressionAssignment(
            ternaryAssignmentLOC,
          ),
        ).to.equal(true);
      });
    });
  });
};
