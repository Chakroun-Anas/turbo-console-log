import { describe } from 'mocha';
import deconstructionVarAssignmentTest from './deconstructionVarAssignment';
import deconstructionArgFunction from './deconstructionArgFunction';
import primitiveVariableTest from './primitiveVariable';
import logLastLineTest from './logLastLine';

export default (): void => {
  describe('Variable context menu', () => {
    deconstructionVarAssignmentTest();
    primitiveVariableTest();
    logLastLineTest();
    deconstructionArgFunction();
  });
};
