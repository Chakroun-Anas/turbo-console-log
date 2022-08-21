import * as assert from "assert";
import { JSLineCodeProcessing } from "../../line-code-processing/js";

const jsLineCodeProcessing: JSLineCodeProcessing = new JSLineCodeProcessing();

suite("JS Line Code Processing", () => {
  suite("Classes", () => {
    test("Check class declaration", () => {
      const classLOCs = [
        `export class JSLineCodeProcessing implements LineCodeProcessing {`,
        `class  HelloWorld extends React.Component {`,
        `class HelloWorld{`,
        `class HelloWorld { `,
      ];
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
      classLOCs.forEach((classLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.doesContainClassDeclaration(classLOC),
          true
        );
      });
      nonClassLOCs.forEach((nonClassLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.doesContainClassDeclaration(nonClassLOC),
          false
        );
      });
    });
    test("Get class name", () => {
      const classLOCs = [
        `export class JSLineCodeProcessing implements LineCodeProcessing {`,
        `export default class JSLineCodeProcessing implements LineCodeProcessing {`,
        `class  MyComponent extends React.Component {`,
        `class HelloWorld{`,
        `class Day { `,
      ];
      const classesNames = [
        "JSLineCodeProcessing",
        "JSLineCodeProcessing",
        "MyComponent",
        "HelloWorld",
        "Day",
      ];
      classLOCs.forEach((classLOC, index) => {
        assert.strictEqual(
          jsLineCodeProcessing.getClassName(classLOC),
          classesNames[index]
        );
      });
    });
  });
  suite("Functions", () => {
    const namedFunctionsLOCs = [
      "function functionName(){",
      "function functionName(){",
      "function sayHello (arg1, arg2) {",
      "module.exports = function functionName (arg1, arg2) {",
      "export default function functionName (arg1, arg2) {",
      "functionName (arg1, arg2, arg3) {",
      "const functionName = function (arg1, arg2) {",
      "let functionName = (arg1, arg2) => {",
      "array.forEach(function functionName() {",
      "export const functionName = (arg1, arg2) => {",
      "const functionName = (arg1: Type1, arg2: Type2) => {",
      "const functionName = (arg1: Type1, arg2: Type2): Type3 => {",
      "functionName(arg1: any): any {",
      "async functionName(arg1: any): any {",
      "public functionName(arg1: any): any {",
      "public async functionName(arg1: any): any {",
      "public static functionName(arg1: any): any {",
      "private functionName(arg1: any): any {",
      "protected functionName(arg1: any): any {",
      "static functionName(arg1: any): any {",
      "export functionName(arg1: any): any {",
      "export default async function functionName(arg1) {",
      "  constructor(fullName) {",
      " async sayHello(somePram: any): Promise<void> {",
      "  unitsValidation( scriptId ): any[] {",
    ];
    const namedFunctionsNames = [
      "functionName",
      "functionName",
      "sayHello",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "functionName",
      "constructor",
      "sayHello",
      "unitsValidation",
    ];
    const nonNamedFunctionsLOCs = [
      "function() {",
      "function(arg1, arg2) {",
      "() => {",
      "(arg1, arg2) => {",
      "module.exports = function (arg1, arg2) {",
      "function( {",
      "function) {",
    ];
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
    const anonymousFunctionsLOCs = [
      'const sayHello = fullName => `Hello ${fullName}`',
      'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
      'fullName => `Hello ${fullName}`'
    ];
    const transformedAnonymousFunctions = [
      'const sayHello = fullName => { `Hello ${fullName}`'
    ]
    test("Check built in function invocation", () => {
      const builtInFunctionInvocationLOCs = [
        `if (a > 0)  {`,
        `if (a > 0) return 0;`,
        `switch (n) {`,
        `for(let i=0; i < 10; i++) {`,
        `while(true) {`,
        `catch(error) {`,
        `do {
    
                } while(true)`,
        `while( n < 3) {
                    n++;
                }`,
      ];
      const nonBuiltInFunctionLOCs = [`function sayHello() {`];
      builtInFunctionInvocationLOCs.forEach((builtInFunctionInvocationLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.doesContainsBuiltInFunction(
            builtInFunctionInvocationLOC
          ),
          true
        );
      });
      nonBuiltInFunctionLOCs.forEach((nonBuiltInFunctionLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.doesContainsBuiltInFunction(
            nonBuiltInFunctionLOC
          ),
          false
        );
      });
    });
    test("Check named function Declaration", () => {
      namedFunctionsLOCs.forEach((namedFunctionLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.doesContainsNamedFunctionDeclaration(
            namedFunctionLOC
          ),
          true
        );
      });
      nonNamedFunctionsLOCs.forEach((nonNamedFunctionLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.doesContainsNamedFunctionDeclaration(
            nonNamedFunctionLOC
          ),
          false
        );
      });
    });
    test("Get function name", () => {
      namedFunctionsLOCs.forEach((namedFunctionLOC, index) => {
        assert.strictEqual(
          jsLineCodeProcessing.getFunctionName(namedFunctionLOC),
          namedFunctionsNames[index]
        );
      });
    });
    test("Assignment of function to a variable", () => {
      functionsAssignmentsLOCs.forEach((functionsAssignmentsLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.isFunctionAssignedToVariable(
            functionsAssignmentsLOC
          ),
          true
        );
      });
    });
    test("Check object function call", () => {
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
        assert.strictEqual(
          jsLineCodeProcessing.isObjectFunctionCall(objectFunctionCallLOC),
          true
        );
      });
      functionsAssignmentsLOCs.forEach((functionsAssignmentsLOC) => {
        assert.strictEqual(
          jsLineCodeProcessing.isObjectFunctionCall(functionsAssignmentsLOC),
          false
        );
      });
    });
    test("Anonymous functions", () => {
      anonymousFunctionsLOCs.forEach(anonymousFunctionLOC => {
        assert.strictEqual(jsLineCodeProcessing.isAnonymousFunction(anonymousFunctionLOC), true);
      })
    });
    test("Arugment of anonymous function", () => {
      anonymousFunctionsLOCs.forEach(anonymousFunctionLOC => {
        assert.strictEqual(jsLineCodeProcessing.isArgumentOfAnonymousFunction(anonymousFunctionLOC, 'fullName'), true);
      });
      assert.strictEqual(jsLineCodeProcessing.isArgumentOfAnonymousFunction(namedFunctionsLOCs[0], 'functionName'), false);
    });
    test("Should transform anonymous function", () => {
      anonymousFunctionsLOCs.forEach(anonymousFunctionLOC => {
        assert.strictEqual(jsLineCodeProcessing.shouldTransformAnonymousFunction(anonymousFunctionLOC), true);
      });
      transformedAnonymousFunctions.forEach(transformedAnonymousFunction => {
        assert.strictEqual(jsLineCodeProcessing.shouldTransformAnonymousFunction(transformedAnonymousFunction), false);
      });
    });
  });
  test("Assignment of object literal to a variable", () => {
    const objLiteralAssignmentLOCs = [
      `var myObject = {
                sProp: 'some string value',
                numProp: 2,
                bProp: false
            };`,
      `var myObject = { sProp: 'some string value', numProp: 2, bProp: false};`,
      `var Swapper = {
                // an array literal
                images: ["smile.gif", "grim.gif", "frown.gif", "bomb.gif"],
                pos: { // nested object literal
                    x: 40,
                    y: 300
                },
                onSwap: function() { // function
                    // code here
                }
            };`,
      `var car = {type:"Fiat", model:"500", color:"white"};`,
      `let person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};`,
      `const person = {
                firstName: "John",
                lastName: "Doe",
                age: 50,
                eyeColor: "blue"
              };`,
      `const variable: FilterObject<UrlRuleEntity> = {
        a: SomeOperator.someFunc(NOW, { orNull: true }),
        ...(undefined !== b && { b }),
        ...(undefined !== c && { c }),
        ...(undefined !== d && { d }),
        ...(Boolean(started) && {
          x: SomeOperator.y(p),
        }),
      };`,
    ];
    const nonObjLiteralAssignmentLOCs = [
      `var myVar = 1;`,
      `var myVar = false`,
      `var myVar = [1, 'hello', false];`,
      `var myVar = [1, 'hello', false];`,
      `let someVar = function sayHello() {
                return true;
       }`,
      `sayHello(someObj: { someProp: string }): number {`,
    ];
    objLiteralAssignmentLOCs.forEach((objLiteralAssignmentLOC) => {
      assert.strictEqual(
        jsLineCodeProcessing.isObjectLiteralAssignedToVariable(
          objLiteralAssignmentLOC
        ),
        true
      );
    });
    nonObjLiteralAssignmentLOCs.forEach((nonObjLiteralAssignmentLOC) => {
      assert.strictEqual(
        jsLineCodeProcessing.isObjectLiteralAssignedToVariable(
          nonObjLiteralAssignmentLOC
        ),
        false
      );
    });
  });
  test("Assignment of an array to a variable", () => {
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
    ];
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
    arrayAssignmentLOCs.forEach((arrayAssignmentLOC) => {
      assert.strictEqual(
        jsLineCodeProcessing.isArrayAssignedToVariable(arrayAssignmentLOC),
        true
      );
    });
    nonArrayAssignmentLOCs.forEach((nonArrayAssignmentLOC) => {
      assert.strictEqual(
        jsLineCodeProcessing.isArrayAssignedToVariable(nonArrayAssignmentLOC),
        false
      );
    });
  });
});
