import { isPhpFile } from '@/helpers/isPhpFile';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('isPhpFile', () => {
  it('returns true when document languageId is php', () => {
    const document = makeTextDocument(['<?php', 'echo "Hello";']);
    Object.defineProperty(document, 'languageId', {
      value: 'php',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(true);
  });

  it('returns false when document languageId is javascript', () => {
    const document = makeTextDocument(['console.log("Hello");']);
    Object.defineProperty(document, 'languageId', {
      value: 'javascript',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(false);
  });

  it('returns false when document languageId is typescript', () => {
    const document = makeTextDocument(['const x: string = "Hello";']);
    Object.defineProperty(document, 'languageId', {
      value: 'typescript',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(false);
  });

  it('returns false when document languageId is typescriptreact', () => {
    const document = makeTextDocument(['const App = () => <div />;']);
    Object.defineProperty(document, 'languageId', {
      value: 'typescriptreact',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(false);
  });

  it('returns false when document languageId is javascriptreact', () => {
    const document = makeTextDocument(['const App = () => <div />;']);
    Object.defineProperty(document, 'languageId', {
      value: 'javascriptreact',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(false);
  });

  it('returns false when document languageId is python', () => {
    const document = makeTextDocument(['print("Hello")']);
    Object.defineProperty(document, 'languageId', {
      value: 'python',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(false);
  });

  it('returns false when document languageId is empty string', () => {
    const document = makeTextDocument(['']);
    Object.defineProperty(document, 'languageId', {
      value: '',
      writable: false,
    });

    const result = isPhpFile(document);

    expect(result).toBe(false);
  });
});
