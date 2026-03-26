import type { TextDocument } from 'vscode';
import fs from 'fs';
import vscode from 'vscode';
import { Message, ExtensionProperties, BracketType } from '@/entities';
import { closingContextLine } from '@/utilities';
import { spacesBeforeLogMsg } from '../js/JSDebugMessage/msg/spacesBeforeLogMsg';

/**
 * Escapes regex special characters in a string to use it safely in a RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fast detection using pure regex on source code without opening document.
 * Returns true if ANY log function calls are found (both Turbo and regular logs).
 * This is Stage 1 - used internally for quick filtering before expensive operations.
 * @internal
 */
function hasLogs(
  sourceCode: string,
  customLogFunction: ExtensionProperties['logFunction'],
): boolean {
  const knownLogFunctions = [
    'error_log',
    'var_dump',
    'print_r',
    customLogFunction,
  ];

  // Build regex pattern to match any log function call (active or commented)
  const logFunctionPattern = knownLogFunctions
    .map((fn) => escapeRegex(fn))
    .join('|');

  // Match both active and commented logs: error_log(...) or // error_log(...) or # error_log(...)
  const logPattern = new RegExp(
    `(?://\\s*|#\\s*)?(${logFunctionPattern})\\s*\\(`,
    'g',
  );

  return logPattern.test(sourceCode);
}

/**
 * Detects all log messages from a PHP file (both Turbo-inserted and regular logs).
 * Uses two-stage optimization:
 * 1. Fast regex prefilter on raw file content (fs.readFile - cheap)
 * 2. Opens VS Code document ONLY if logs are found (expensive operation)
 * Marks each log message with isTurboConsoleLog flag to distinguish Turbo logs from regular ones.
 *
 * @param vscodeModule Optional injected vscode module (for Pro bundle context)
 * @param phpParser Optional injected php-parser module (for Pro bundle context) - not used here but kept for consistency
 */
export async function detectAll(
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
      'error_log',
      'var_dump',
      'print_r',
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

  // Pattern for active logs: error_log(...), var_dump(...), print_r(...)
  const activeLogPattern = new RegExp(
    `^\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );

  // Pattern for commented logs: // error_log(...) or # error_log(...)
  const commentedLogPattern = new RegExp(
    `^\\s*(?://|#)\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
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

    // Extract the log function name (e.g., 'error_log', 'var_dump', 'print_r')
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
      const content = line.text.trim(); // Capture single-line content
      messages.push({
        spaces,
        lines: [line.rangeIncludingLineBreak],
        content,
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
    logMessage.content = msg.trim(); // Capture multi-line content (normalized)

    messages.push(logMessage);
  }

  return messages;
}
