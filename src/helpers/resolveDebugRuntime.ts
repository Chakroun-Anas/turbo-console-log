import * as vscode from 'vscode';
import { DebugMessage } from '@/debug-message';
import { jsDebugMessage } from '@/debug-message/js';
import { phpDebugMessage } from '@/debug-message/php';
import { pythonDebugMessage } from '@/debug-message/python';
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

export function resolveDebugRuntime(
  document: vscode.TextDocument,
): ResolvedDebugRuntime {
  if (isPhpFile(document)) {
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
    debugMessage: jsDebugMessage,
    language: 'javascript',
  };
}

export function resolveLogFunctionForRuntime(
  language: SupportedRuntimeLanguage,
  requestedLogType: InsertCommandLogType,
  customLogFunction: string,
): string {
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
      case 'custom':
        return customLogFunction && customLogFunction !== 'log'
          ? customLogFunction
          : 'var_dump';
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
      case 'custom':
        return customLogFunction && customLogFunction !== 'log'
          ? customLogFunction
          : 'print';
      default:
        return 'print';
    }
  }

  // JavaScript
  if (requestedLogType === 'custom') {
    return customLogFunction || 'log';
  }

  return requestedLogType;
}
