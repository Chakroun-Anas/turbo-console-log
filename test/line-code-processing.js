const lineCodeProcessing = require('../line-code-processing')

const chai = require('chai')
const expect = chai.expect

describe('Source Code Processing', () => {
  const classesDeclarations = [
    'class HelloWorld{', 'class HelloWorld {', 'class HelloWorld  {',
    ' class HelloWorld{', ' class HelloWorld {', ' class HelloWorld  {',
    '  class HelloWorld{', '  class HelloWorld {', '  class HelloWorld  {',
    'class  HelloWorld extends React.Component {'
  ]
  const cssClassesDeclarations = [
    '<button className="SomeClass" onClick={ this.functionToExecute.bind(this) }>SUBMIT</button>'
  ]
  const namedFunctions = [
    'function functionName(){', 'function functionName (arg1, arg2) {', 'functionName (arg1, arg2, arg3) {', 'functionName = function (arg1, arg2) {',
    'functionName = (arg1, arg2) => {', 'functionName = function otherName (arg1, arg2) => {', 'array.forEach(function functionName() {'
  ]
  const nonNamedFunctions = [
    'function() {', 'function(arg1, arg2) {', '() => {', '(arg1, arg2) => {'
  ]
  const jSBuiltInStatements = [
    'if (a > 0)  {', 'switch (n) {', 'for(let i=0; i < 10; i++) {', 'while(true) {'
  ]
  it('Check if the line code represents a class declaration', () => {
    classesDeclarations.forEach(classDeclaration => {
      expect(lineCodeProcessing.checkClassDeclaration(classDeclaration)).to.equal(true)
    })
    cssClassesDeclarations.forEach(cssClassDeclaration => {
      expect(lineCodeProcessing.checkClassDeclaration(cssClassDeclaration)).to.equal(false)
    })
  }),
  it('Get class name from a line code representing a class declaration', () => {
    classesDeclarations.forEach(classDeclaration => {
      expect(lineCodeProcessing.className(classDeclaration)).to.equal('HelloWorld')
    })
  }),
  it('Check if the code line represents a named function declaration', () => {
    namedFunctions.forEach(namedFunction => {
      // console.log('Function Declaration: ', namedFunction);
      expect(lineCodeProcessing.checkIfNamedFunction(namedFunction)).to.equal(true)
    })
    nonNamedFunctions.forEach(nonNamedFunction => {
      // console.log('Non Named Function: ', nonNamedFunction);
      expect(lineCodeProcessing.checkIfNamedFunction(nonNamedFunction)).to.equal(false)
    })
  })
  it('Check if the code line represents an if, switch, while or for statement', () => {
    jSBuiltInStatements.forEach(jSBuiltInStatement => {
      // console.log('If Or Switch Statement: ', ifOrSwitchStatement);
      expect(lineCodeProcessing.checkIfJSBuiltInStatement(jSBuiltInStatement)).to.equal(true)
    })
  })
  it('Get function name from a line code representing a function declaration', () => {
    namedFunctions.forEach(namedFunction => {
      expect(lineCodeProcessing.functionName(namedFunction)).to.equal('functionName')
    })
  })
})
