import * as vscode from 'vscode';
import { DebugMessage } from '@/debug-message';
import { pythonDebugMessage } from '@/debug-message/python';
import { loadPhpDebugMessage } from './loadPhpDebugMessage';
import { isPhpFile } from './isPhpFile';
import { isPythonFile } from './isPythonFile';

export type SupportedRuntimeLanguage = 'javascript' | 'php' | 'python';
export type InsertCommandLogType =
  | 'log'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'table'
  | 'custom';

export type ResolvedDebugRuntime = {
  commentPrefix: '//' | '#';
  debugMessage: DebugMessage;
  language: SupportedRuntimeLanguage;
};

export async function resolveDebugRuntime(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  defaultDebugMessage: DebugMessage,
): Promise<ResolvedDebugRuntime | null> {
  if (isPhpFile(document)) {
    const phpDebugMessage = await loadPhpDebugMessage(context);
    if (!phpDebugMessage) {
      return null;
    }

    return {
      commentPrefix: '//',
      debugMessage: phpDebugMessage,
      language: 'php',
    };
  }

  if (isPythonFile(document)) {
    return {
      commentPrefix: '#',
      debugMessage: pythonDebugMessage,
      language: 'python',
    };
  }

  return {
    commentPrefix: '//',
    debugMessage: defaultDebugMessage,
    language: 'javascript',
  };
}

export function resolveLogFunctionForRuntime(
  language: SupportedRuntimeLanguage,
  requestedLogType: InsertCommandLogType,
  customLogFunction: string,
): string {
  if (requestedLogType === 'custom') {
    if (language === 'python' && customLogFunction === 'log') {
      return 'print';
    }

    return customLogFunction || 'log';
  }

  if (language === 'php') {
    switch (requestedLogType) {
      case 'log':
        return 'var_dump';
      case 'info':
      case 'table':
        return 'print_r';
      case 'debug':
      case 'warn':
      case 'error':
        return 'error_log';
      default:
        return 'var_dump';
    }
  }

  if (language === 'python') {
    switch (requestedLogType) {
      case 'log':
      case 'table':
        return 'print';
      case 'debug':
        return 'logging.debug';
      case 'info':
        return 'logging.info';
      case 'warn':
        return 'logging.warning';
      case 'error':
        return 'logging.error';
      default:
        return 'print';
    }
  }

  return requestedLogType;
}