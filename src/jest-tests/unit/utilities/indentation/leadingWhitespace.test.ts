import { leadingWhitespace } from '@/utilities/indentation';

describe('leadingWhitespace', () => {
  it('returns the spaces in front of the code', () => {
    expect(leadingWhitespace('    const total = 0;')).toBe('    ');
  });

  it('returns the tabs in front of the code', () => {
    expect(leadingWhitespace('\t\treturn total;')).toBe('\t\t');
  });

  it('keeps tabs and alignment spaces as written, in order', () => {
    expect(leadingWhitespace('\t  .then(render);')).toBe('\t  ');
    expect(leadingWhitespace('  \tfoo();')).toBe('  \t');
  });

  it('returns an empty string for a line at column 0', () => {
    expect(leadingWhitespace('export const answer = 42;')).toBe('');
  });

  it('returns an empty string for an empty line', () => {
    expect(leadingWhitespace('')).toBe('');
  });

  it('returns the whole line when it holds only whitespace', () => {
    expect(leadingWhitespace('    ')).toBe('    ');
    expect(leadingWhitespace('\t\t')).toBe('\t\t');
  });

  it('stops at the first character of code', () => {
    expect(leadingWhitespace('  if (a &&  b) {  ')).toBe('  ');
  });

  it('returns the indent of a block comment continuation', () => {
    expect(leadingWhitespace('   * @param user the signed in user')).toBe(
      '   ',
    );
  });
});
