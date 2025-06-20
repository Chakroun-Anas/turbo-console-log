import helpers from '../../helpers';

describe('Assignment of an array to a variable', () => {
  it('Should return true for array assignment LOCs', () => {
    const arrayAssignmentLOCs = [
      `let    myArray =   [
                        1,
                        2,
                        3
                    ];`,
      `var someArray = ['one', true, {someProp: false}];`,
      `const someArray =  [function sayHello()   {
                        return true;
                    }, true, false, 'hie'];`,
      `export const SLIDE_LEFT_ANIMATION = [`,
      `config.module.rules = [`,
      'const routes: Routes = [',
    ];
    arrayAssignmentLOCs.forEach((arrayAssignmentLOC) => {
      expect(
        helpers.jsLineCodeProcessing.isArrayAssignedToVariable(
          arrayAssignmentLOC,
        ),
      ).toBe(true);
    });
  });
  it('Should return false for non-array assignment LOCs', () => {
    const nonArrayAssignmentLOCs = [
      `var myVar = 1;`,
      `var myVar = false`,
      `let someVar = function sayHello() {
                        return true;
                    }`,
      `let person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};`,
      `const person = {
                        firstName: "John",
                        lastName: "Doe",
                        age: 50,
                        eyeColor: "blue"
                    };
                    `,
      `someFunc(someArray: Array<number> = [1, 2, 3]) {}`,
    ];
    nonArrayAssignmentLOCs.forEach((nonArrayAssignmentLOC) => {
      expect(
        helpers.jsLineCodeProcessing.isArrayAssignedToVariable(
          nonArrayAssignmentLOC,
        ),
      ).toBe(false);
    });
  });
});
