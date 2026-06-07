import {
  isLoggingModuleImported,
  loggingImportInsertLine,
} from '@/debug-message/python/PythonDebugMessage/msg/loggingImport/loggingImport';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

function setup(lines: string[]) {
  const doc = makeTextDocument(lines, 'test.py', 'python');
  return { doc, program: parseCode(doc) };
}

describe('Python loggingImport', () => {
  describe('isLoggingModuleImported', () => {
    it.each([
      ['import logging', true],
      ['import logging.handlers', true],
      ['import os, logging', true],
      ['import logging  # trailing comment', true],
    ])('binds `logging` for `%s`', (line, expected) => {
      const { doc, program } = setup([line, 'x = 1']);
      expect(isLoggingModuleImported(program, doc)).toBe(expected);
    });

    it.each([
      ['import logging as log'], // alias binds `log`, not `logging`
      ['from logging import warning'], // imports names FROM logging, not the module
      ['from logging import warning, debug'],
      ['import os'],
      ['x = 1'], // no import at all
    ])('does NOT bind `logging` for `%s`', (line) => {
      const { doc, program } = setup([line, 'x = 1']);
      expect(isLoggingModuleImported(program, doc)).toBe(false);
    });

    it('detects logging even when other imports precede it', () => {
      const { doc, program } = setup([
        'import os',
        'import sys',
        'import logging',
        'x = 1',
      ]);
      expect(isLoggingModuleImported(program, doc)).toBe(true);
    });
  });

  describe('loggingImportInsertLine', () => {
    it('inserts at the top of a plain file', () => {
      const { doc, program } = setup(['x = 1', 'y = 2']);
      expect(loggingImportInsertLine(program, doc)).toBe(0);
    });

    it('inserts after a shebang', () => {
      const { doc, program } = setup(['#!/usr/bin/env python', 'x = 1']);
      expect(loggingImportInsertLine(program, doc)).toBe(1);
    });

    it('inserts after a module docstring', () => {
      const { doc, program } = setup(['"""Module doc."""', 'x = 1']);
      expect(loggingImportInsertLine(program, doc)).toBe(1);
    });

    it('inserts after `from __future__` imports (never before them)', () => {
      const { doc, program } = setup([
        '"""Module doc."""',
        'from __future__ import annotations',
        'x = 1',
      ]);
      expect(loggingImportInsertLine(program, doc)).toBe(2);
    });

    it('inserts after __future__ but before other imports', () => {
      const { doc, program } = setup([
        'from __future__ import annotations',
        'import os',
        'x = 1',
      ]);
      expect(loggingImportInsertLine(program, doc)).toBe(1);
    });

    it('inserts at end of file when only a docstring is present', () => {
      const { doc, program } = setup(['"""Module doc."""']);
      expect(loggingImportInsertLine(program, doc)).toBe(doc.lineCount);
    });
  });
});
