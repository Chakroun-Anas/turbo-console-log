import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../../helpers';

export default (): void => {
  describe('Nullish operator assignment', () => {
    it('Should correctly place log after nullish coalescing assignment', () => {
      const nullishLOC = `
          const data = someValue ?? defaultValue;
        `;
      expect(
        helpers.jsLineCodeProcessing.isNullishCoalescingAssignment(nullishLOC),
      ).to.equal(true);
    });
  });
};
