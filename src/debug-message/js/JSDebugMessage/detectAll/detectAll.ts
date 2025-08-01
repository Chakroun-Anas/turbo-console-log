import ts from 'typescript';
import type { TextDocument } from 'vscode';
import { Message, ExtensionProperties, BracketType } from '@/entities';
import { spacesBeforeLogMsg } from '../msg/spacesBeforeLogMsg';
import { closingContextLine } from '@/utilities';

/**
 * Detects all Turbo-inserted log messages in a document by parsing the AST
 * and also checking for commented log messages with Turbo patterns.
 * Matches known log functions and filters by Turbo prefix and delimiter.
 */
export function detectAll(
  document: TextDocument,
  customLogFunction: ExtensionProperties['logFunction'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
): Message[] {
  const messages: Message[] = [];

  const knownLogFunctions = [
    'console.log',
    'console.info',
    'console.debug',
    'console.warn',
    'console.error',
    'console.table',
    customLogFunction,
  ];

  // First, detect active (uncommented) log messages using AST
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const calleeName = extractCalleeName(node.expression);

      if (!calleeName || !knownLogFunctions.includes(calleeName)) {
        // Continue visiting children even if this isn't a log function
        ts.forEachChild(node, visit);
        return;
      }

      const [arg] = node.arguments;
      if (
        !arg ||
        (!ts.isStringLiteral(arg) &&
          !ts.isNoSubstitutionTemplateLiteral(arg) &&
          !ts.isTemplateExpression(arg))
      ) {
        ts.forEachChild(node, visit);
        return;
      }

      const argText = arg.getText();
      const hasPrefix = argText.includes(logMessagePrefix);
      const hasDelimiter = argText.includes(delimiterInsideMessage);

      if (!hasPrefix || !hasDelimiter) {
        return;
      }

      const start = node.getStart();
      const end = node.getEnd();

      const startPos = document.positionAt(start);
      const endPos = document.positionAt(end);

      const startLine = startPos.line;
      const endLine = endPos.line;

      const spaces = spacesBeforeLogMsg(document, startLine, endLine);
      const lines = [];

      for (let i = startLine; i <= endLine; i++) {
        lines.push(document.lineAt(i).rangeIncludingLineBreak);
      }

      messages.push({
        spaces,
        lines,
      });
    }
    ts.forEachChild(node, visit);
  };

  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(document.fileName),
  );

  visit(sourceFile);

  // Second, detect commented log messages using text-based pattern matching
  const commentedMessages = detectCommentedLogs(
    document,
    knownLogFunctions,
    logMessagePrefix,
    delimiterInsideMessage,
  );

  // Combine both sets of messages and sort by line number
  messages.push(...commentedMessages);
  messages.sort((a, b) => a.lines[0].start.line - b.lines[0].start.line);

  return messages;
}

/**
 * Detects commented log messages that contain Turbo patterns.
 * Looks for lines starting with '//' followed by known log functions with prefix and delimiter,
 */
function detectCommentedLogs(
  document: TextDocument,
  knownLogFunctions: string[],
  logMessagePrefix: string,
  delimiterInsideMessage: string,
): Message[] {
  const messages: Message[] = [];
  const documentNbrOfLines: number = document.lineCount;
  const logRegexPattern = new RegExp(
    `^\\s*//\\s*(${knownLogFunctions.join('|').replace(/\./g, '\\.')})\\b`,
  );
  const prefixRegex = new RegExp(logMessagePrefix);
  const delimiterRegex = new RegExp(delimiterInsideMessage);
  for (let i = 0; i < documentNbrOfLines; i++) {
    const line = document.lineAt(i);
    const lineText = line.text.trim();
    if (!logRegexPattern.test(lineText)) continue;
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
    if (
      closedParenthesisLine === i &&
      prefixRegex.test(lineText) &&
      delimiterRegex.test(lineText)
    ) {
      const spaces = spacesBeforeLogMsg(document, i, closedParenthesisLine);
      messages.push({
        spaces,
        lines: [line.rangeIncludingLineBreak],
        isCommented: true,
      });
      continue;
    }
    const logMessage: Message = {
      spaces: '',
      lines: [],
      isCommented: true,
    };
    logMessage.spaces = spacesBeforeLogMsg(document, i, i);
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

/**
 * Extracts the full callee name from a CallExpression node.
 * E.g. for `console.log`, returns "console.log"
 * E.g. for `myLogger.log`, returns "myLogger.log"
 */
function extractCalleeName(expr: ts.Expression): string | null {
  if (ts.isPropertyAccessExpression(expr)) {
    const objectName = expr.expression.getText();
    const methodName = expr.name.getText();
    return `${objectName}.${methodName}`;
  }

  if (ts.isIdentifier(expr)) {
    return expr.getText();
  }

  return null;
}

/**
 * Determines the appropriate TypeScript ScriptKind based on file extension
 */
function getScriptKind(fileName: string): ts.ScriptKind {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'tsx':
      return ts.ScriptKind.TSX;
    case 'jsx':
      return ts.ScriptKind.JSX;
    case 'js':
      return ts.ScriptKind.JS;
    case 'ts':
    default:
      return ts.ScriptKind.TS;
  }
}
