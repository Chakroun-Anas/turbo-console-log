import { BracketType } from '@/entities';
import { closingContextLine } from '@/utilities';
import { openTurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';

const locBracketsMock = jest.fn();
jest.mock('../../../utilities/locBrackets', () => ({
  locBrackets: (...args: unknown[]) => locBracketsMock(...args),
}));

describe('closingContextLine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('returns same line when braces close on the same line', () => {
    const doc = openTurboTextDocument('function foo() { return 42; }');
    locBracketsMock.mockReturnValueOnce({
      openingBrackets: 1,
      closingBrackets: 1,
    });
    expect(closingContextLine(doc, 0, BracketType.CURLY_BRACES)).toBe(0);
  });

  it('finds closing line across multiple lines', () => {
    const doc = openTurboTextDocument(
      'function foo() {\n' + '  console.log("bar");\n' + '}',
    );
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
    const doc = openTurboTextDocument(
      'function foo() {\n' + // 0
        '  if (true) {\n' + // 1
        '    console.log(1);\n' + // 2
        '  }\n' + // 3
        '}', // 4  ← should return here
    );
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
    const doc = openTurboTextDocument('function foo() { console.log("oops");');
    locBracketsMock.mockReturnValueOnce({
      openingBrackets: 1,
      closingBrackets: 0,
    });
    expect(closingContextLine(doc, 0, BracketType.CURLY_BRACES)).toBe(-1);
  });
});
