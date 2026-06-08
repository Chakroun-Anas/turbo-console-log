import { jsDebugMessage } from '@/debug-message/js';
import { phpDebugMessage } from '@/debug-message/php';
import { pythonDebugMessage } from '@/debug-message/python';
import {
  resolveDebugRuntime,
  resolveLogFunctionForRuntime,
} from '@/helpers/resolveDebugRuntime';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('resolveDebugRuntime', () => {
  it('returns the python runtime for python documents', () => {
    const document = makeTextDocument(['value = 1'], 'main.py', 'python');

    const runtime = resolveDebugRuntime(document);

    expect(runtime).toEqual({
      commentPrefix: '#',
      debugMessage: pythonDebugMessage,
      language: 'python',
    });
  });

  it('returns the core php runtime for php documents', () => {
    const document = makeTextDocument(['<?php'], 'main.php', 'php');

    const runtime = resolveDebugRuntime(document);

    expect(runtime).toEqual({
      commentPrefix: '//',
      debugMessage: phpDebugMessage,
      language: 'php',
    });
  });

  it('returns the js runtime for javascript documents', () => {
    const document = makeTextDocument(['const value = 1;'], 'main.ts', 'typescript');

    const runtime = resolveDebugRuntime(document);

    expect(runtime).toEqual({
      commentPrefix: '//',
      debugMessage: jsDebugMessage,
      language: 'javascript',
    });
  });
});

describe('resolveLogFunctionForRuntime', () => {
  describe('python', () => {
    it('maps log to print', () => {
      expect(resolveLogFunctionForRuntime('python', 'log', 'log')).toBe('print');
    });

    it('maps table to print', () => {
      expect(resolveLogFunctionForRuntime('python', 'table', 'log')).toBe('print');
    });

    it('maps debug to logging.debug', () => {
      expect(resolveLogFunctionForRuntime('python', 'debug', 'log')).toBe('logging.debug');
    });

    it('maps info to logging.info', () => {
      expect(resolveLogFunctionForRuntime('python', 'info', 'log')).toBe('logging.info');
    });

    it('maps warn to logging.warning', () => {
      expect(resolveLogFunctionForRuntime('python', 'warn', 'log')).toBe('logging.warning');
    });

    it('maps error to logging.error', () => {
      expect(resolveLogFunctionForRuntime('python', 'error', 'log')).toBe('logging.error');
    });

    describe('custom', () => {
      it('returns the custom function when provided', () => {
        expect(resolveLogFunctionForRuntime('python', 'custom', 'my_logger')).toBe('my_logger');
      });

      it('falls back to print when the custom function is the default log', () => {
        expect(resolveLogFunctionForRuntime('python', 'custom', 'log')).toBe('print');
      });

      it('falls back to print when the custom function is empty', () => {
        expect(resolveLogFunctionForRuntime('python', 'custom', '')).toBe('print');
      });
    });
  });

  describe('php', () => {
    it('maps log to var_dump', () => {
      expect(resolveLogFunctionForRuntime('php', 'log', 'log')).toBe('var_dump');
    });

    it('maps info to print_r', () => {
      expect(resolveLogFunctionForRuntime('php', 'info', 'log')).toBe('print_r');
    });

    it('maps table to print_r', () => {
      expect(resolveLogFunctionForRuntime('php', 'table', 'log')).toBe('print_r');
    });

    it('maps debug to error_log', () => {
      expect(resolveLogFunctionForRuntime('php', 'debug', 'log')).toBe('error_log');
    });

    it('maps warn to error_log', () => {
      expect(resolveLogFunctionForRuntime('php', 'warn', 'log')).toBe('error_log');
    });

    it('maps error to error_log', () => {
      expect(resolveLogFunctionForRuntime('php', 'error', 'log')).toBe('error_log');
    });

    describe('custom', () => {
      it('returns the custom function when provided', () => {
        expect(resolveLogFunctionForRuntime('php', 'custom', 'my_logger')).toBe('my_logger');
      });

      it('falls back to var_dump when the custom function is the default log', () => {
        expect(resolveLogFunctionForRuntime('php', 'custom', 'log')).toBe('var_dump');
      });

      it('falls back to var_dump when the custom function is empty', () => {
        expect(resolveLogFunctionForRuntime('php', 'custom', '')).toBe('var_dump');
      });
    });
  });

  describe('javascript', () => {
    it('maps log to log', () => {
      expect(resolveLogFunctionForRuntime('javascript', 'log', 'log')).toBe('log');
    });

    it('maps debug to debug', () => {
      expect(resolveLogFunctionForRuntime('javascript', 'debug', 'log')).toBe('debug');
    });

    it('maps info to info', () => {
      expect(resolveLogFunctionForRuntime('javascript', 'info', 'log')).toBe('info');
    });

    it('maps warn to warn', () => {
      expect(resolveLogFunctionForRuntime('javascript', 'warn', 'log')).toBe('warn');
    });

    it('maps error to error', () => {
      expect(resolveLogFunctionForRuntime('javascript', 'error', 'log')).toBe('error');
    });

    it('maps table to table', () => {
      expect(resolveLogFunctionForRuntime('javascript', 'table', 'log')).toBe('table');
    });

    describe('custom', () => {
      it('returns the custom function when provided', () => {
        expect(resolveLogFunctionForRuntime('javascript', 'custom', 'logger.info')).toBe('logger.info');
      });

      it('falls back to log when the custom function is empty', () => {
        expect(resolveLogFunctionForRuntime('javascript', 'custom', '')).toBe('log');
      });
    });
  });
});
