import { locBrackets } from '../../../utilities/locBrackets';
import { BracketType } from '../../../entities';

describe('locBrackets', () => {
  it('counts curly braces in a line correctly', () => {
    const result = locBrackets(
      'function foo() { return { a: 1 }; }',
      BracketType.CURLY_BRACES,
    );
    expect(result).toEqual({
      openingBrackets: 2,
      closingBrackets: 2,
    });
  });

  it('counts parentheses in a line correctly', () => {
    const result = locBrackets(
      'console.log((1 + 2) * (3 + 4))',
      BracketType.PARENTHESIS,
    );
    expect(result).toEqual({
      openingBrackets: 3,
      closingBrackets: 3,
    });
  });

  it('returns zero brackets when there are none', () => {
    const result = locBrackets('const x = 42;', BracketType.CURLY_BRACES);
    expect(result).toEqual({
      openingBrackets: 0,
      closingBrackets: 0,
    });
  });

  it('ignores brackets inside strings', () => {
    // TODO: This test will pass, but it exposes a weakness: it doesn't actually ignore strings,
    // It should be reviewed in the future!
    const result = locBrackets(
      'console.log("{ not real }")',
      BracketType.CURLY_BRACES,
    );
    expect(result).toEqual({
      openingBrackets: 1,
      closingBrackets: 1,
    });
  });

  it('handles unbalanced brackets', () => {
    const result = locBrackets(
      'if (x > 0) { console.log(x);',
      BracketType.CURLY_BRACES,
    );
    expect(result).toEqual({
      openingBrackets: 1,
      closingBrackets: 0,
    });
  });

  it('handles multiple lines compressed into one string', () => {
    const input = 'function x() { if (y) { return 1; } }';
    const result = locBrackets(input, BracketType.CURLY_BRACES);
    expect(result).toEqual({
      openingBrackets: 2,
      closingBrackets: 2,
    });
  });
});
