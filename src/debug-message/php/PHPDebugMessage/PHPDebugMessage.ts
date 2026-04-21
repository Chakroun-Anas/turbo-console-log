import type { TextDocument, TextEditorEdit } from 'vscode';
import vscode from 'vscode';
import phpParser from 'php-parser';
import { ExtensionProperties, Message } from '@/entities';
import { DebugMessage } from '@/debug-message/DebugMessage';
import { detectAll } from './detectAll/detectAll';
import { msg } from './msg/msg';

/**
 * PHPDebugMessage: Implements the DebugMessage interface for PHP language support.
 * Enables automatic debug log insertion for PHP files.
 *
 * Supports PHP-specific constructs:
 * - Variable assignments ($var = value)
 * - Function parameters and calls
 * - Array access and manipulation
 * - Object property access
 * - Class methods and properties
 * - Namespaces and use statements
 *
 * Uses error_log(), var_dump(), or print_r() based on configuration.
 */
export const phpDebugMessage: DebugMessage = {
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
    logFunction: string,
  ): void {
    msg(
      textEditor,
      document,
      selectedVar,
      lineOfSelectedVar,
      tabSize,
      extensionProperties,
      logFunction,
      vscode,
      phpParser,
    );
  },
  async detectAll(
    fs: typeof import('fs'),
    vscode: typeof import('vscode'),
    filePath: string,
    logFunction: ExtensionProperties['logFunction'],
    logMessagePrefix: ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
  ): Promise<Message[]> {
    return detectAll(
      fs,
      vscode,
      filePath,
      logFunction,
      logMessagePrefix,
      delimiterInsideMessage,
    );
  },
};
