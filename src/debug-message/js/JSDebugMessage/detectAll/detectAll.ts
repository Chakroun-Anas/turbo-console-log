import type { TextDocument } from 'vscode';
import { Message, ExtensionProperties, BracketType } from '@/entities';
import { spacesBeforeLogMsg } from '../msg/spacesBeforeLogMsg';
import { closingContextLine } from '@/utilities';

/**
 * Escapes regex special characters in a string to use it safely in a RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fast detection using pure regex on source code without opening document or parsing AST.
 * Only returns true if potential Turbo logs are found.
 * This is Stage 1 - used internally for quick filtering before expensive operations.
 * @internal
 */
function hasTurboLogs(
  sourceCode: string,
  customLogFunction: ExtensionProperties['logFunction'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
): boolean {
  const knownLogFunctions = [
    'console.log',
    'console.info',
    'console.debug',
    'console.warn',
    'console.error',
    'console.table',
    customLogFunction,
  ];

  // Build regex pattern to match any log function call
  const logFunctionPattern = knownLogFunctions
    .map((fn) => escapeRegex(fn))
    .join('|');

  // Match both active and commented logs that contain prefix and delimiter
  // Matches: console.log(...) or // console.log(...)
  const turboLogPattern = new RegExp(
    `(?://\\s*)?(${logFunctionPattern})\\s*\\([^)]*${logMessagePrefix}[^)]*${delimiterInsideMessage}[^)]*\\)`,
    'g',
  );

  return turboLogPattern.test(sourceCode);
}

/**
 * Detects all Turbo-inserted log messages from a file.
 * Uses two-stage optimization:
 * 1. Fast regex prefilter on raw file content (fs.readFile - cheap)
 * 2. Opens VS Code document ONLY if logs are found (expensive operation)
 * This avoids expensive openTextDocument calls for files without logs.
 */
export async function detectAll(
  fs: typeof import('fs'),
  vscode: typeof import('vscode'),
  filePath: string,
  customLogFunction: ExtensionProperties['logFunction'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
): Promise<Message[]> {
  try {
    // Stage 1: Fast prefilter - read raw file content with fs (cheap)
    const sourceCode = await fs.promises.readFile(filePath, 'utf8');

    if (
      !hasTurboLogs(
        sourceCode,
        customLogFunction,
        logMessagePrefix,
        delimiterInsideMessage,
      )
    ) {
      return []; // No logs found - avoid expensive openTextDocument call!
    }

    // Stage 2: Logs found! Now open VS Code document for detailed detection (expensive)
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);

    const knownLogFunctions = [
      'console.log',
      'console.info',
      'console.debug',
      'console.warn',
      'console.error',
      'console.table',
      customLogFunction,
    ];

    // Detect all log messages (both active and commented) using unified detection
    const messages = detectLogMessages(
      document,
      knownLogFunctions,
      logMessagePrefix,
      delimiterInsideMessage,
    );

    // Sort by line number
    messages.sort((a, b) => a.lines[0].start.line - b.lines[0].start.line);

    return messages;
  } catch (error) {
    console.error(
      `Failed to detect logs in file "${filePath}":`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * Detects all log messages (both active and commented) using regex pattern matching.
 * Much faster than AST parsing for this use case.
 */
function detectLogMessages(
  document: TextDocument,
  knownLogFunctions: string[],
  logMessagePrefix: string,
  delimiterInsideMessage: string,
): Message[] {
  const messages: Message[] = [];
  const documentNbrOfLines: number = document.lineCount;

  // Pattern for active logs: console.log(...)
  const activeLogPattern = new RegExp(
    `^\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );

  // Pattern for commented logs: // console.log(...)
  const commentedLogPattern = new RegExp(
    `^\\s*//\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );

  const prefixRegex = new RegExp(logMessagePrefix);
  const delimiterRegex = new RegExp(delimiterInsideMessage);

  for (let i = 0; i < documentNbrOfLines; i++) {
    const line = document.lineAt(i);
    const lineText = line.text.trim();

    // Check if line is a commented or active log
    const isCommented = commentedLogPattern.test(lineText);
    const isActive = !isCommented && activeLogPattern.test(lineText);

    if (!isCommented && !isActive) continue;

    // Find the closing parenthesis for the log call
    const closedParenthesisLine = closingContextLine(
      document,
      i,
      BracketType.PARENTHESIS,
    );

    if (
      closedParenthesisLine === -1 ||
      closedParenthesisLine < i ||
      closedParenthesisLine >= documentNbrOfLines
    ) {
      continue;
    }

    // Single-line log statement
    if (closedParenthesisLine === i) {
      if (prefixRegex.test(lineText) && delimiterRegex.test(lineText)) {
        const spaces = spacesBeforeLogMsg(document, i, closedParenthesisLine);
        messages.push({
          spaces,
          lines: [line.rangeIncludingLineBreak],
          ...(isCommented && { isCommented: true }),
        });
      }
      continue;
    }

    // Multi-line log statement
    const logMessage: Message = {
      spaces: spacesBeforeLogMsg(document, i, closedParenthesisLine),
      lines: [],
      ...(isCommented && { isCommented: true }),
    };

    let msg = '';
    for (let j = i; j <= closedParenthesisLine; j++) {
      msg += document.lineAt(j).text;
      logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
    }

    if (prefixRegex.test(msg) && delimiterRegex.test(msg)) {
      messages.push(logMessage);
    }
  }

  return messages;
}
