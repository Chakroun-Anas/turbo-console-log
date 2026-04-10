import { isPythonFile } from '@/helpers/isPythonFile';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('isPythonFile', () => {
  it('returns true when document languageId is python', () => {
    const document = makeTextDocument(['print("Hello")'], 'mock.py', 'python');

    expect(isPythonFile(document)).toBe(true);
  });

  it('returns false for javascript documents', () => {
    const document = makeTextDocument(
      ['console.log("Hello")'],
      'mock.ts',
      'javascript',
    );

    expect(isPythonFile(document)).toBe(false);
  });

  it('returns false for php documents', () => {
    const document = makeTextDocument(['<?php echo "Hello";'], 'mock.php', 'php');

    expect(isPythonFile(document)).toBe(false);
  });
});