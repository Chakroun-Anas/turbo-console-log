import helpers from '../../helpers';

describe('Function call', () => {
  it('Should return true if the LOC is a function call', () => {
    const functionCallLOCs = [`const setGlobal = useCallback(() => {`];
    functionCallLOCs.forEach((functionCallLOC) => {
      expect(helpers.jsLineCodeProcessing.isFunctionCall(functionCallLOC)).toBe(
        true,
      );
    });
  });
  it('Should return false if the LOC is not a function call', () => {
    const notFunctionCallLOCs = [`const namedFunction = function () {`];
    notFunctionCallLOCs.forEach((notFunctionCallLOC) => {
      expect(
        helpers.jsLineCodeProcessing.isFunctionCall(notFunctionCallLOC),
      ).toBe(false);
    });
  });
});
