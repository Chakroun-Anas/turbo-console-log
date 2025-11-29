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
 * Returns true if ANY log function calls are found (both Turbo and regular logs).
 * This is Stage 1 - used internally for quick filtering before expensive operations.
 * @internal
 */
function hasLogs(
  sourceCode: string,
  customLogFunction: ExtensionProperties['logFunction'],
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

  // Build regex pattern to match any log function call (active or commented)
  const logFunctionPattern = knownLogFunctions
    .map((fn) => escapeRegex(fn))
    .join('|');

  // Match both active and commented logs: console.log(...) or // console.log(...)
  const logPattern = new RegExp(
    `(?://\\s*)?(${logFunctionPattern})\\s*\\(`,
    'g',
  );

  return logPattern.test(sourceCode);
}

/**
 * Detects all log messages from a file (both Turbo-inserted and regular logs).
 * Uses two-stage optimization:
 * 1. Fast regex prefilter on raw file content (fs.readFile - cheap)
 * 2. Opens VS Code document ONLY if logs are found (expensive operation)
 * Marks each log message with isTurboConsoleLog flag to distinguish Turbo logs from regular ones.
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

    if (!hasLogs(sourceCode, customLogFunction)) {
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
 * Detects all log messages (both active and commented, Turbo and regular) using regex pattern matching.
 * Much faster than AST parsing for this use case.
 * Marks each message with isTurboConsoleLog flag to distinguish Turbo logs from regular ones.
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

  const prefixRegex = new RegExp(escapeRegex(logMessagePrefix));
  const delimiterRegex = new RegExp(escapeRegex(delimiterInsideMessage));

  for (let i = 0; i < documentNbrOfLines; i++) {
    const line = document.lineAt(i);
    const lineText = line.text.trim();

    // Check if line is a commented or active log
    const isCommented = commentedLogPattern.test(lineText);
    const isActive = !isCommented && activeLogPattern.test(lineText);

    if (!isCommented && !isActive) continue;

    // Extract the log function name (e.g., 'console.log', 'console.warn')
    let logFunctionMatch = null;
    if (isCommented) {
      logFunctionMatch = lineText.match(commentedLogPattern);
    } else {
      logFunctionMatch = lineText.match(activeLogPattern);
    }
    const logFunction = logFunctionMatch ? logFunctionMatch[1] : undefined;

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
      const hasTurboMarkers =
        prefixRegex.test(lineText) && delimiterRegex.test(lineText);
      const spaces = spacesBeforeLogMsg(document, i, closedParenthesisLine);
      messages.push({
        spaces,
        lines: [line.rangeIncludingLineBreak],
        ...(isCommented && { isCommented: true }),
        ...(logFunction && { logFunction }),
        isTurboConsoleLog: hasTurboMarkers,
      });
      continue;
    }

    // Multi-line log statement
    const logMessage: Message = {
      spaces: spacesBeforeLogMsg(document, i, closedParenthesisLine),
      lines: [],
      ...(isCommented && { isCommented: true }),
      ...(logFunction && { logFunction }),
    };

    let msg = '';
    for (let j = i; j <= closedParenthesisLine; j++) {
      msg += document.lineAt(j).text;
      logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
    }

    const hasTurboMarkers = prefixRegex.test(msg) && delimiterRegex.test(msg);
    logMessage.isTurboConsoleLog = hasTurboMarkers;

    messages.push(logMessage);
  }

  return messages;
}
