import { indentUnit } from '@/utilities/indentation';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';

describe('indentUnit', () => {
  const tabFile = makeTextDocument([
    'function greet(name) {',
    '\treturn `Hello ${name}`;',
    '}',
  ]);
  const spaceFile = makeTextDocument([
    'function greet(name) {',
    '  return `Hello ${name}`;',
    '}',
  ]);

  describe('when the line opening the block is indented', () => {
    it('returns a tab when that indent is made of tabs', () => {
      expect(indentUnit(spaceFile, '\t\t', 4)).toBe('\t');
    });

    it('returns a tab when tabs indent and spaces align', () => {
      expect(indentUnit(spaceFile, '\t  ', 4)).toBe('\t');
    });

    it('returns the editor tab size in spaces when that indent is made of spaces', () => {
      expect(indentUnit(spaceFile, '  ', 2)).toBe('  ');
      expect(indentUnit(spaceFile, '    ', 4)).toBe('    ');
    });

    it('returns one level, not a copy of that indent', () => {
      expect(indentUnit(spaceFile, '        ', 2)).toBe('  ');
    });

    it('follows that indent rather than the rest of the file', () => {
      expect(indentUnit(tabFile, '  ', 2)).toBe('  ');
      expect(indentUnit(spaceFile, '\t', 2)).toBe('\t');
    });
  });

  describe('when the block opens at column 0', () => {
    it('returns a tab when the first indented line of the file starts with a tab', () => {
      expect(indentUnit(tabFile, '', 4)).toBe('\t');
    });

    it('returns the editor tab size in spaces when the first indented line starts with spaces', () => {
      expect(indentUnit(spaceFile, '', 2)).toBe('  ');
    });

    it('lets the first indented line of the file decide', () => {
      const document = makeTextDocument([
        'class Cart {',
        '  total() {}',
        '}',
        'class Order {',
        '\ttotal() {}',
        '}',
      ]);
      expect(indentUnit(document, '', 2)).toBe('  ');
    });

    it('skips empty and whitespace-only lines', () => {
      const document = makeTextDocument([
        'const rate = 0.2;',
        '',
        '    ',
        'function tax(amount) {',
        '\treturn amount * rate;',
        '}',
      ]);
      expect(indentUnit(document, '', 4)).toBe('\t');
    });

    it('does not take the single space of a block comment for an indent', () => {
      const document = makeTextDocument([
        '/**',
        ' * Greets a user by name.',
        ' */',
        'function greet(name) {',
        '\treturn `Hello ${name}`;',
        '}',
      ]);
      expect(indentUnit(document, '', 4)).toBe('\t');
    });

    it('returns the editor tab size in spaces when no line of the file is indented', () => {
      const document = makeTextDocument(['function noop() {', '}']);
      expect(indentUnit(document, '', 4)).toBe('    ');
    });
  });
});
