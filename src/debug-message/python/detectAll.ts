import type { TextDocument } from 'vscode';
import { Message, ExtensionProperties, BracketType } from '@/entities';
import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg/spacesBeforeLogMsg';
import { closingContextLine } from '@/utilities';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getKnownLogFunctions(customLogFunction: string): string[] {
  return [
    'print',
    'logging.debug',
    'logging.info',
    'logging.warning',
    'logging.warn',
    'logging.error',
    'logging.exception',
    'logging.critical',
    customLogFunction,
  ].filter(Boolean);
}

function hasLogs(
  sourceCode: string,
  customLogFunction: ExtensionProperties['logFunction'],
): boolean {
  const logFunctionPattern = getKnownLogFunctions(customLogFunction)
    .map((fn) => escapeRegex(fn))
    .join('|');
  const logPattern = new RegExp(
    `(?:#\\s*)?(${logFunctionPattern})\\s*\\(`,
    'g',
  );

  return logPattern.test(sourceCode);
}

export async function detectAll(
  fs: typeof import('fs'),
  vscode: typeof import('vscode'),
  filePath: string,
  customLogFunction: ExtensionProperties['logFunction'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
): Promise<Message[]> {
  try {
    const sourceCode = await fs.promises.readFile(filePath, 'utf8');

    if (!hasLogs(sourceCode, customLogFunction)) {
      return [];
    }

    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    const messages = detectLogMessages(
      document,
      getKnownLogFunctions(customLogFunction),
      logMessagePrefix,
      delimiterInsideMessage,
    );

    messages.sort((a, b) => a.lines[0].start.line - b.lines[0].start.line);

    return messages;
  } catch (error) {
    console.error(
      `Failed to detect Python logs in file "${filePath}":`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

function detectLogMessages(
  document: TextDocument,
  knownLogFunctions: string[],
  logMessagePrefix: string,
  delimiterInsideMessage: string,
): Message[] {
  const messages: Message[] = [];
  const documentNbrOfLines = document.lineCount;
  const activeLogPattern = new RegExp(
    `^\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );
  const commentedLogPattern = new RegExp(
    `^\\s*#\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );
  const prefixRegex = new RegExp(escapeRegex(logMessagePrefix));
  const delimiterRegex = new RegExp(escapeRegex(delimiterInsideMessage));

  for (let index = 0; index < documentNbrOfLines; index++) {
    const line = document.lineAt(index);
    const lineText = line.text.trim();
    const isCommented = commentedLogPattern.test(lineText);
    const isActive = !isCommented && activeLogPattern.test(lineText);

    if (!isCommented && !isActive) {
      continue;
    }

    const logFunctionMatch = lineText.match(
      isCommented ? commentedLogPattern : activeLogPattern,
    );
    const logFunction = logFunctionMatch ? logFunctionMatch[1] : undefined;
    const closedParenthesisLine = closingContextLine(
      document,
      index,
      BracketType.PARENTHESIS,
    );

    if (
      closedParenthesisLine === -1 ||
      closedParenthesisLine < index ||
      closedParenthesisLine >= documentNbrOfLines
    ) {
      continue;
    }

    if (closedParenthesisLine === index) {
      messages.push({
        spaces: spacesBeforeLogMsg(document, index, closedParenthesisLine),
        lines: [line.rangeIncludingLineBreak],
        ...(isCommented && { isCommented: true }),
        ...(logFunction && { logFunction }),
        isTurboConsoleLog:
          prefixRegex.test(lineText) && delimiterRegex.test(lineText),
      });
      continue;
    }

    const logMessage: Message = {
      spaces: spacesBeforeLogMsg(document, index, closedParenthesisLine),
      lines: [],
      ...(isCommented && { isCommented: true }),
      ...(logFunction && { logFunction }),
    };

    let fullMessage = '';
    for (let cursor = index; cursor <= closedParenthesisLine; cursor++) {
      fullMessage += document.lineAt(cursor).text;
      logMessage.lines.push(document.lineAt(cursor).rangeIncludingLineBreak);
    }

    logMessage.isTurboConsoleLog =
      prefixRegex.test(fullMessage) && delimiterRegex.test(fullMessage);
    messages.push(logMessage);
  }

  return messages;
}