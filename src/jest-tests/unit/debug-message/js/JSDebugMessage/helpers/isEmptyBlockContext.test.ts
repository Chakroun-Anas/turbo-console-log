import { isEmptyBlockContext } from '../../../../../../debug-message/js/JSDebugMessage/helpers/isEmptyBlockContext';
import { LogMessageType, LogMessage } from '../../../../../../entities/';
import { makeTextDocument } from '../../../../../mocks/helpers';

describe('isEmptyBlockContext', () => {
  it('returns true for an empty MultilineParenthesis block', () => {
    const doc = makeTextDocument(['someFunc(foo, bar) { }']);
    const logMessage: LogMessage = {
      logMessageType: LogMessageType.FunctionParameter,
    };
    const result = isEmptyBlockContext(doc, logMessage, 1);
    expect(result).toBe(true);
  });
  it('returns true for an empty NamedFunctionAssignment block', () => {
    const doc = makeTextDocument(['const transform = (x) => { };']);

    const logMessage: LogMessage = {
      logMessageType: LogMessageType.NamedFunctionAssignment,
      metadata: {
        line: 1,
      },
    };

    const result = isEmptyBlockContext(doc, logMessage, 1);
    expect(result).toBe(true);
  });
});
