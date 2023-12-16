import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Assignment of a function to a variable', () => {
    it('Should return true if the LOC is an assignment of a function to a variable', () => {
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
        'onDragStart={(start: DragStart, provided: ResponderProvided) => {',
      ];
      functionsAssignmentsLOCs.forEach((functionsAssignmentsLOC) => {
        expect(
          helpers.jsLineCodeProcessing.isFunctionAssignedToVariable(
            functionsAssignmentsLOC,
          ),
        ).to.equal(true);
      });
    });
  });
};
