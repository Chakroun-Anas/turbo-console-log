import helpers from '../../helpers';

describe('Check class declaration', () => {
  it('Should return true for class declaration LOCs', () => {
    const classLOCs = [
      `export class JSLineCodeProcessing implements LineCodeProcessing {`,
      `class  HelloWorld extends React.Component {`,
      `class HelloWorld{`,
      `class HelloWorld { `,
    ];
    classLOCs.forEach((classLOC) => {
      expect(
        helpers.jsLineCodeProcessing.doesContainClassDeclaration(classLOC),
      ).toBe(true);
    });
  });
  it('Should return false for non-class declaration LOCs', () => {
    const nonClassLOCs = [
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
                      };`,
      `function classicMoves() {`,
    ];
    nonClassLOCs.forEach((nonClassLOC) => {
      expect(
        helpers.jsLineCodeProcessing.doesContainClassDeclaration(nonClassLOC),
      ).toBe(false);
    });
  });
});
