import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Anonymous function', () => {
    it('Should return true if the LOC is an anonymous function', () => {
      const anonymousFunctionsLOCs = [
        'const sayHello = fullName => `Hello ${fullName}`',
        'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
        'fullName => `Hello ${fullName}`',
      ];
      anonymousFunctionsLOCs.forEach((anonymousFunctionLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isAnonymousFunction(
            anonymousFunctionLOC,
          ),
        ).to.equal(true);
      });
    });
    it('Should return true if the LOC is an argument of an anonymous function', () => {
      const anonymousFunctionsLOCs = [
        'const sayHello = fullName => `Hello ${fullName}`',
        'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
        'fullName => `Hello ${fullName}`',
      ];
      anonymousFunctionsLOCs.forEach((anonymousFunctionLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isArgumentOfAnonymousFunction(
            anonymousFunctionLOC,
            'fullName',
          ),
        ).to.equal(true);
      });
    });
    it('Should return false if the LOC is not an argument of an anonymous function', () => {
      expect(
        helpers.jsLineCodeProcessing.isArgumentOfAnonymousFunction(
          'function functionName(parameter){',
          'parameter',
        ),
      ).to.equal(false);
    });
    it('Should return true if anonymous function needs to be transformed', () => {
      const anonymousFunctionsLOCs = [
        'const sayHello = fullName => `Hello ${fullName}`',
        'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
        'fullName => `Hello ${fullName}`',
      ];
      anonymousFunctionsLOCs.forEach((anonymousFunctionLOC) => {
        expect(
          helpers.jsLineCodeProcessing.shouldTransformAnonymousFunction(
            anonymousFunctionLOC,
          ),
        ).to.equal(true);
      });
    });
    it('Should return false if anonymous function is already transformed', () => {
      const transformedAnonymousFunctions = [
        'const sayHello = fullName => { `Hello ${fullName}`',
      ];
      transformedAnonymousFunctions.forEach((transformedAnonymousFunction) => {
        expect(
          helpers.jsLineCodeProcessing.shouldTransformAnonymousFunction(
            transformedAnonymousFunction,
          ),
        ).to.equal(false);
      });
    });
  });
};
