import { describe } from 'mocha';
import logObjectPropertyTest from './logObjectProperty';
import objectVariableTest from './objectVariable';
import objectFunctionCall from './objFunctionCall';
import objFunctionCallNoAssignmentTest from './objFunctionCallNoAssignment';
import objWithTypeTest from './objWithType';
import objectLiteralTests from './objectLiteral';

export default (): void => {
  describe('Object context', () => {
    logObjectPropertyTest();
    objectVariableTest();
    objectFunctionCall();
    objFunctionCallNoAssignmentTest();
    objWithTypeTest();
    objectLiteralTests();
  });
};
