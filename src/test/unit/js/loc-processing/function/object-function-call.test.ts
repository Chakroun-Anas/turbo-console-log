import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Object function call', () => {
    it('Should return true if the LOC is an object function call', () => {
      const objectFunctionCallLOCs = [
        `const x = obj.someFunc();`,
        `const x = obj.someFunc()`,
        `const myVar = obj.someFunc(1, true, false);`,
        `const myVar = obj.
                someFunc(
                  1, 
                  true, 
                  false
                );
              `,
        `const myVar = obj
                .someFunc(
                  1, 
                  true, 
                  false
                );
              `,
        `const subscription = this.userService.currentUser.subscribe(`,
        `this.subscription = this.userService.currentUser.subscribe(`,
        `this.subscription.add(`,
      ];
      objectFunctionCallLOCs.forEach((objectFunctionCallLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isObjectFunctionCall(
            objectFunctionCallLOC,
          ),
        ).to.equal(true);
      });
    });
    it('Should return false if the LOC is not an object function call', () => {
      const functionsAssignmentsLOCs = [
        `const x = someFunc();`,
        `const x = someFunc()`,
        `const myVar = someFunc(1, true, false);`,
        `const myVar = someFunc(
              1, 
              true, 
              false
            );`,
        `const x = function () {`,
        `const myVar = function sayHello(fullName) {
              return 'hello';
            }`,
        `const myVar =  (fullName) => {
              return 'hello';
            }`,
      ];
      functionsAssignmentsLOCs.forEach((functionsAssignmentsLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isObjectFunctionCall(
            functionsAssignmentsLOC,
          ),
        ).to.equal(false);
      });
    });
  });
};
