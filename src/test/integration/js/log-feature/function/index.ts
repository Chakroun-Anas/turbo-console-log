import { describe } from 'mocha';

import anonymousFunctionsTest from './anonymousFunctions';
import emptyFuncTest from './emptyFunc';
import functionAssignedToVariableTest from './functionAssignedToVariable';
import functionMultiLineParametersTest from './functionMultiLineParameters';
import functionParamTest from './functionParam';
import functionWithDecoratorsTest from './functionWithDecorators';
import oneLineFunctionParamTest from './oneLineFunctionParam';
import promiseAnonymousFunctionTest from './promiseAnonymousFunction';
import functionCallAssignedToVariableTest from './functionCall';
import typedFunctionCallAssignment from './typedFunctionCall';
import functionObjectPropertyTests from './objectProperty';
import functionCallAsLastStatement from './functionCallAsLastStatement';
import variableWithinReturnStatement from './variableWithinReturnStatement';
export default (): void => {
  describe('Function Context', () => {
    anonymousFunctionsTest();
    emptyFuncTest();
    functionAssignedToVariableTest();
    functionMultiLineParametersTest();
    functionParamTest();
    functionWithDecoratorsTest();
    oneLineFunctionParamTest();
    promiseAnonymousFunctionTest();
    functionCallAssignedToVariableTest();
    functionObjectPropertyTests();
    functionCallAsLastStatement();
    typedFunctionCallAssignment();
    variableWithinReturnStatement();
  });
};
