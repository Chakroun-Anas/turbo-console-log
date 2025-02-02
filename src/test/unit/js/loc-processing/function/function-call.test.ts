import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Function call', () => {
    it('Should return true if the LOC is a function call', () => {
      const functionCallLOCs = [`const setGlobal = useCallback(() => {`];
      functionCallLOCs.forEach((functionCallLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isFunctionCall(functionCallLOC),
        ).to.equal(true);
      });
    });
    it('Should return false if the LOC is not a function call', () => {
      const notFunctionCallLOCs = [`const namedFunction = function () {`];
      notFunctionCallLOCs.forEach((notFunctionCallLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isFunctionCall(notFunctionCallLOC),
        ).to.equal(false);
      });
    });
  });
};
