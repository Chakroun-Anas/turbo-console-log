import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Typed Function call', () => {
    it('Should return true if the LOC is a typed function call', () => {
      const typedFunctionCallLOCs = [
        'const result = myFunc<',
        'const result = myFunc<T ',
        'const result = myFunc<T, ',
      ];
      typedFunctionCallLOCs.forEach((typedFunctionCallLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isTypedFunctionCallAssignment(
            typedFunctionCallLOC,
          ),
        ).to.equal(true);
      });
    });
    it('Should return false if the LOC is not a typed function call', () => {
      const noneTypedFunctionCallLOCs = [
        'const result = myFunc<T>()',
        'const result = myFunc',
      ];
      noneTypedFunctionCallLOCs.forEach((noneTypedFunctionCallLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isTypedFunctionCallAssignment(
            noneTypedFunctionCallLOC,
          ),
        ).to.equal(false);
      });
    });
  });
};
