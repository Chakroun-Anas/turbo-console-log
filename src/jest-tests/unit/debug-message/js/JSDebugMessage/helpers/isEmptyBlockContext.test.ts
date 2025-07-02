import { isEmptyBlockContext } from '../../../../../../debug-message/js/JSDebugMessage/helpers/isEmptyBlockContext';
import { LogMessageType, LogMessage } from '../../../../../../entities/';
import { makeTextDocument } from '../../../../../mocks/helpers';

describe('isEmptyBlockContext', () => {
  it('returns true for an empty MultilineParenthesis block', () => {
    const doc = makeTextDocument(['someFunc(foo, bar) { }']);
    const logMessage: LogMessage = {
      logMessageType: LogMessageType.NamedFunction,
      metadata: {
        line: 0,
      },
    };
    const result = isEmptyBlockContext(doc, logMessage);
    expect(result).toBe(true);
  });
  it('returns true for an empty NamedFunctionAssignment block', () => {
    const doc = makeTextDocument(['const transform = (x) => { };']);

    const logMessage: LogMessage = {
      logMessageType: LogMessageType.NamedFunctionAssignment,
      metadata: {
        line: 0,
      },
    };

    const result = isEmptyBlockContext(doc, logMessage);
    expect(result).toBe(true);
  });
});
