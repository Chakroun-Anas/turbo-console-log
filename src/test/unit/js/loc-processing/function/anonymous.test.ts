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
    it('Should return true if the indicated parameter is an argument of the anonymous function', () => {
      const anonymousFunctionsArgs = [
        {
          loc: 'const sayHello = fullName => `Hello ${fullName}`',
          arg: 'fullName',
        },
        {
          loc: 'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
          arg: 'fullName',
        },
        {
          loc: 'fullName => `Hello ${fullName}`',
          arg: 'fullName',
        },
        {
          loc: 'const user = users.find(item => item.email === email)',
          arg: 'item',
        },
      ];
      anonymousFunctionsArgs.forEach(({ loc, arg }) => {
        expect(
          helpers.jsLineCodeProcessing.isArgumentOfAnonymousFunction(loc, arg),
        ).to.equal(true);
      });
    });
    it('Should return false if the indicated parameter is not an argument of the anonymous function', () => {
      expect(
        helpers.jsLineCodeProcessing.isArgumentOfAnonymousFunction(
          'function functionName(parameter){',
          'parameter',
        ),
      ).to.equal(false);
      expect(
        helpers.jsLineCodeProcessing.isArgumentOfAnonymousFunction(
          'const user = users.find(item => item.email === email)',
          'user',
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
