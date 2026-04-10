import { phpDebugMessage } from '@/debug-message/php';
import { pythonDebugMessage } from '@/debug-message/python';
import {
  resolveDebugRuntime,
  resolveLogFunctionForRuntime,
} from '@/helpers/resolveDebugRuntime';
import { makeDebugMessage, makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('resolveDebugRuntime', () => {
  it('returns the python runtime for python documents', () => {
    const debugMessage = makeDebugMessage();
    const document = makeTextDocument(['value = 1'], 'main.py', 'python');

    const runtime = resolveDebugRuntime(document, debugMessage);

    expect(runtime).toEqual({
      commentPrefix: '#',
      debugMessage: pythonDebugMessage,
      language: 'python',
    });
  });

  it('returns the core php runtime for php documents', () => {
    const debugMessage = makeDebugMessage();
    const document = makeTextDocument(['<?php'], 'main.php', 'php');

    const runtime = resolveDebugRuntime(document, debugMessage);

    expect(runtime).toEqual({
      commentPrefix: '//',
      debugMessage: phpDebugMessage,
      language: 'php',
    });
  });

  it('keeps the default runtime for javascript documents', () => {
    const debugMessage = makeDebugMessage();
    const document = makeTextDocument(['const value = 1;'], 'main.ts', 'typescript');

    const runtime = resolveDebugRuntime(document, debugMessage);

    expect(runtime).toEqual({
      commentPrefix: '//',
      debugMessage,
      language: 'javascript',
    });
  });
});

describe('resolveLogFunctionForRuntime', () => {
  it('maps python log to print', () => {
    expect(resolveLogFunctionForRuntime('python', 'log', 'log')).toBe('print');
  });

  it('maps python warn to logging.warning', () => {
    expect(resolveLogFunctionForRuntime('python', 'warn', 'log')).toBe(
      'logging.warning',
    );
  });

  it('maps php table to print_r', () => {
    expect(resolveLogFunctionForRuntime('php', 'table', 'log')).toBe('print_r');
  });
});
