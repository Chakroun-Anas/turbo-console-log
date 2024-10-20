import { describe } from 'mocha';
import deconstructionVarAssignmentTest from './deconstructionVarAssignment';
import deconstructionArgFunction from './deconstructionArgFunction';
import primitiveVariableTest from './primitiveVariable';
import logLastLineTest from './logLastLine';
import valueFromFunctionCall from './valueFromFunctionCall';

export default (): void => {
  describe('Variable context menu', () => {
    deconstructionVarAssignmentTest();
    primitiveVariableTest();
    logLastLineTest();
    deconstructionArgFunction();
    valueFromFunctionCall();
  });
};
