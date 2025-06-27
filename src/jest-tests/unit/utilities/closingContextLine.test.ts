import { closingContextLine } from '../../../utilities/closingContextLine';
import { BracketType } from '../../../entities';
import { makeTextDocument } from '../../mocks/helpers';

const locBracketsMock = jest.fn();
jest.mock('../../../utilities/locBrackets', () => ({
  locBrackets: (...args: unknown[]) => locBracketsMock(...args),
}));

describe('closingContextLine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('returns same line when braces close on the same line', () => {
    const doc = makeTextDocument(['function foo() { return 42; }']);
    locBracketsMock.mockReturnValueOnce({
      openingBrackets: 1,
      closingBrackets: 1,
    });
    expect(closingContextLine(doc, 0, BracketType.CURLY_BRACES)).toBe(0);
  });

  it('finds closing line across multiple lines', () => {
    const doc = makeTextDocument([
      'function foo() {',
      '  console.log("bar");',
      '}',
    ]);
    locBracketsMock
      .mockReturnValueOnce({
        openingBrackets: 1,
        closingBrackets: 0,
      })
      .mockReturnValueOnce({
        openingBrackets: 0,
        closingBrackets: 0,
      })
      .mockReturnValueOnce({
        openingBrackets: 0,
        closingBrackets: 1,
      });
    expect(closingContextLine(doc, 0, BracketType.CURLY_BRACES)).toBe(2);
  });

  it('handles nested scopes and still finds outer closing brace', () => {
    const doc = makeTextDocument([
      'function foo() {', // 0
      '  if (true) {', // 1
      '    console.log(1);', // 2
      '  }', // 3
      '}', // 4  ← should return here
    ]);
    locBracketsMock
      .mockReturnValueOnce({
        openingBrackets: 1,
        closingBrackets: 0,
      })
      .mockReturnValueOnce({
        openingBrackets: 1,
        closingBrackets: 0,
      })
      .mockReturnValueOnce({
        openingBrackets: 0,
        closingBrackets: 0,
      })
      .mockReturnValueOnce({
        openingBrackets: 0,
        closingBrackets: 1,
      })
      .mockReturnValueOnce({
        openingBrackets: 0,
        closingBrackets: 1,
      });
    expect(closingContextLine(doc, 0, BracketType.CURLY_BRACES)).toBe(4);
  });

  it('returns -1 when braces never close', () => {
    const doc = makeTextDocument(['function foo() { console.log("oops");']);
    locBracketsMock.mockReturnValueOnce({
      openingBrackets: 1,
      closingBrackets: 0,
    });
    expect(closingContextLine(doc, 0, BracketType.CURLY_BRACES)).toBe(-1);
  });
});
