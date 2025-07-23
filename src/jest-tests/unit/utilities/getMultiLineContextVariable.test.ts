import { BracketType } from '@/entities';
import { getMultiLineContextVariable } from '@/utilities';
import { makeTextDocument } from '../../mocks/helpers';

const locMock = jest.fn();
const closeMock = jest.fn();

jest.mock('../../../utilities/locBrackets', () => ({
  locBrackets: (...a: unknown[]) => locMock(...a),
}));
jest.mock('../../../utilities/closingContextLine', () => ({
  closingContextLine: (...a: unknown[]) => closeMock(...a),
}));

describe('getMultiLineContextVariable', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null for balanced single line inside inner scope', () => {
    const doc = makeTextDocument(['foo(bar);']);
    locMock.mockReturnValueOnce({ openingBrackets: 1, closingBrackets: 1 });
    const res = getMultiLineContextVariable(
      doc,
      0,
      BracketType.PARENTHESIS,
      /*innerScope=*/ true,
    );
    expect(res).toBeNull();
  });

  it('walks upward and finds opening/closing lines', () => {
    const lines = [
      'function foo(bar, baz) {',
      'const x = 0',
      '  return bar + baz;',
      '}',
    ];
    const doc = makeTextDocument(lines);

    locMock
      .mockReturnValueOnce({ openingBrackets: 0, closingBrackets: 0 })
      .mockReturnValueOnce({ openingBrackets: 0, closingBrackets: 0 })
      .mockReturnValueOnce({ openingBrackets: 1, closingBrackets: 0 });

    closeMock.mockReturnValue(3);

    const res = getMultiLineContextVariable(
      doc,
      2,
      BracketType.CURLY_BRACES,
      false,
    );
    expect(res).toEqual({ openingContextLine: 0, closingContextLine: 3 });
  });

  it('returns null when completely unbalanced and not parenthesis', () => {
    const doc = makeTextDocument(['{ unclosed']);
    locMock.mockReturnValueOnce({ openingBrackets: 1, closingBrackets: 0 });
    const res = getMultiLineContextVariable(
      doc,
      0,
      BracketType.CURLY_BRACES,
      false,
    );
    expect(res).toBeNull();
  });
});
