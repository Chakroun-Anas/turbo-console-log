import { pythonDebugMessage } from '@/debug-message/python';
import {
  resolveDebugRuntime,
  resolveLogFunctionForRuntime,
} from '@/helpers/resolveDebugRuntime';
import { loadPhpDebugMessage } from '@/helpers/loadPhpDebugMessage';
import {
  makeDebugMessage,
  makeExtensionContext,
  makeTextDocument,
} from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers/loadPhpDebugMessage');

describe('resolveDebugRuntime', () => {
  const mockLoadPhpDebugMessage = loadPhpDebugMessage as jest.MockedFunction<
    typeof loadPhpDebugMessage
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the python runtime for python documents', async () => {
    const context = makeExtensionContext();
    const debugMessage = makeDebugMessage();
    const document = makeTextDocument(['value = 1'], 'main.py', 'python');

    const runtime = await resolveDebugRuntime(context, document, debugMessage);

    expect(runtime).toEqual({
      commentPrefix: '#',
      debugMessage: pythonDebugMessage,
      language: 'python',
    });
    expect(mockLoadPhpDebugMessage).not.toHaveBeenCalled();
  });

  it('loads the php runtime for php documents', async () => {
    const context = makeExtensionContext();
    const debugMessage = makeDebugMessage();
    const phpDebugMessage = makeDebugMessage();
    const document = makeTextDocument(['<?php'], 'main.php', 'php');
    mockLoadPhpDebugMessage.mockResolvedValue(phpDebugMessage);

    const runtime = await resolveDebugRuntime(context, document, debugMessage);

    expect(mockLoadPhpDebugMessage).toHaveBeenCalledWith(context);
    expect(runtime).toEqual({
      commentPrefix: '//',
      debugMessage: phpDebugMessage,
      language: 'php',
    });
  });

  it('keeps the default runtime for javascript documents', async () => {
    const context = makeExtensionContext();
    const debugMessage = makeDebugMessage();
    const document = makeTextDocument(['const value = 1;'], 'main.ts', 'typescript');

    const runtime = await resolveDebugRuntime(context, document, debugMessage);

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