import vscode from 'vscode';
import {
  isBlockStatement,
  walk,
  type AcornNode,
  type ArrowFunctionExpression,
  type BlockStatement,
} from '../acorn-utils';
import { findTransformationTarget } from './helpers';

interface TransformationOptions {
  addSemicolonInTheEnd: boolean;
  tabSize: number;
}

type Replacement = { start: number; end: number; text: string };

export function performTransformation(
  ast: AcornNode,
  document: vscode.TextDocument,
  line: number,
  selectedVar: string,
  debuggingMsg: string,
  options: TransformationOptions,
): string {
  const sourceCode = document.getText();
  if (!ast) {
    return sourceCode;
  }

  // Rewrite exactly the function needTransformation decided on.
  const target = findTransformationTarget(ast, document, line, selectedVar);
  if (!target) {
    return sourceCode; // No transformation applied
  }

  const logStatement = normalizeLogStatement(
    debuggingMsg,
    options.addSemicolonInTheEnd,
  );
  const replacement = isBlockStatement(target.body)
    ? blockBodyReplacement(
        sourceCode,
        target.body,
        logStatement,
        options.tabSize,
      )
    : expressionBodyReplacement(
        sourceCode,
        target as ArrowFunctionExpression,
        logStatement,
        options.tabSize,
      );

  return (
    sourceCode.slice(0, replacement.start) +
    replacement.text +
    sourceCode.slice(replacement.end)
  );
}

function normalizeLogStatement(
  debuggingMsg: string,
  addSemicolonInTheEnd: boolean,
): string {
  const trimmed = debuggingMsg.trim();
  if (addSemicolonInTheEnd && !trimmed.endsWith(';')) return trimmed + ';';
  if (!addSemicolonInTheEnd && trimmed.endsWith(';')) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

/**
 * Get the indentation of the line holding a specific position in the source code
 */
function getIndentAtPosition(sourceCode: string, pos: number): string {
  const lineStart = sourceCode.lastIndexOf('\n', pos - 1) + 1;
  const lineText = sourceCode.slice(
    lineStart,
    sourceCode.indexOf('\n', lineStart),
  );
  const match = lineText.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * A wrapped log is several lines, all at the indent of the insertion line:
 * moves the ones after the first to the indent of the rewritten body too.
 */
function indentLogLines(logStatement: string, bodyIndent: string): string {
  const [firstLine, ...otherLines] = logStatement.split('\n');
  return [
    firstLine,
    ...otherLines.map((line) => bodyIndent + line.trimStart()),
  ].join('\n');
}

/**
 * The first line of a returned expression moves to `newIndent`: moves the lines
 * after it by the same amount. The content of multi-line strings stays as
 * written, since moving it would change their value.
 */
function moveBodyLines(
  sourceCode: string,
  body: AcornNode,
  bodyText: string,
  searchFrom: number,
  newIndent: string,
): string {
  const textStart = sourceCode.indexOf(bodyText, searchFrom);
  const oldIndent = getIndentAtPosition(sourceCode, textStart);
  const strings: AcornNode[] = [];
  walk(body, (node): boolean | void => {
    if (node.type !== 'TemplateLiteral' && node.type !== 'Literal') return;
    strings.push(node);
    return true;
  });

  let lineStart = textStart;
  return bodyText
    .split('\n')
    .map((line, index) => {
      const start = lineStart;
      lineStart += line.length + 1;
      const isInString = strings.some(
        (node) => node.start < start && start < node.end,
      );
      if (index === 0 || isInString) return line;
      if (line.trim() === '' || !line.startsWith(oldIndent)) return line;
      return newIndent + line.slice(oldIndent.length);
    })
    .join('\n');
}

/**
 * Opens a block body whose content (or closing brace) sits on its brace line
 * and puts the log on the first line of the body: `{}`, `{ return value; }`.
 */
function blockBodyReplacement(
  sourceCode: string,
  body: BlockStatement,
  logStatement: string,
  tabSize: number,
): Replacement {
  const indent = getIndentAtPosition(sourceCode, body.start);
  const bodyIndent = indent + ' '.repeat(tabSize);
  const opening = `{\n${bodyIndent}${indentLogLines(logStatement, bodyIndent)}\n`;
  const inner = sourceCode.slice(body.start + 1, body.end - 1).trim();
  const bodyText = sourceCode.slice(body.start, body.end);

  let text: string;
  if (inner === '') {
    text = `${opening}${indent}}`;
  } else if (!bodyText.includes('\n')) {
    text = `${opening}${bodyIndent}${inner}\n${indent}}`;
  } else {
    // The following lines keep their own layout, closing brace included.
    const rest = sourceCode.slice(body.start + 1, body.end).trimStart();
    text = `${opening}${bodyIndent}${rest}`;
  }
  return { start: body.start, end: body.end, text };
}

/**
 * Turns an expression-bodied arrow into a block that logs, then returns the
 * original expression.
 */
function expressionBodyReplacement(
  sourceCode: string,
  arrowFunc: ArrowFunctionExpression,
  normalized: string,
  tabSize: number,
): Replacement {
  const bodyStart = arrowFunc.body.start;

  // Get the actual arrow position by finding the "=>" in the source
  const nodeText = sourceCode.slice(arrowFunc.start, bodyStart);
  const arrowIndex = nodeText.lastIndexOf('=>');
  const arrowEnd = arrowFunc.start + arrowIndex + 2; // +2 for the length of "=>"

  // Get the original body text (from AST boundaries)
  const bodyEnd = arrowFunc.body.end;
  const bodyText = sourceCode.slice(bodyStart, bodyEnd);

  // Check for comments between arrow and body by looking at the text between arrowEnd and bodyStart
  const betweenArrowAndBody = sourceCode.slice(arrowEnd, bodyStart).trim();
  const hasLeadingComments =
    betweenArrowAndBody.length > 0 &&
    betweenArrowAndBody !== '(' &&
    betweenArrowAndBody !== '(\n';

  let actualBodyText = bodyText;
  let hasParentheses = false;

  // Check if the body is wrapped in parentheses (common for JSX)
  const trimmedBodyText = bodyText.trim();
  if (trimmedBodyText.startsWith('(') && trimmedBodyText.endsWith(')')) {
    hasParentheses = true;
    actualBodyText = trimmedBodyText.slice(1, -1).trim();
  } else {
    // Check if parentheses are in the source after the arrow: ") => ("
    const afterArrow = sourceCode.slice(arrowEnd).trim();
    if (afterArrow.startsWith('(')) {
      // Find the matching closing parenthesis
      const fullArrowExpression = sourceCode.slice(arrowEnd, bodyEnd + 10);
      if (
        fullArrowExpression.includes(')\n') ||
        fullArrowExpression.endsWith(')')
      ) {
        hasParentheses = true;
      }
    }
  }

  // If there are comments, include them in the body text
  if (hasLeadingComments) {
    // Get the full text from arrow to the end of the arrow function to capture comments
    const fullTextFromArrow = sourceCode.slice(arrowEnd, arrowFunc.end).trim();

    // Remove trailing parenthesis and whitespace for functions like "=> ( JSX )"
    const textWithoutTrailingParen = fullTextFromArrow.endsWith(')')
      ? fullTextFromArrow.slice(0, -1).trim()
      : fullTextFromArrow;

    // Remove leading parenthesis if present
    if (textWithoutTrailingParen.startsWith('(')) {
      hasParentheses = true;
      actualBodyText = textWithoutTrailingParen.slice(1).trim();
    } else {
      actualBodyText = textWithoutTrailingParen;
    }
  }

  const indent = getIndentAtPosition(sourceCode, arrowFunc.start);
  const bodyIndent = indent + ' '.repeat(tabSize);

  // Extract everything before the arrow, then add the arrow
  const beforeArrow = sourceCode.slice(arrowFunc.start, arrowEnd);

  // Build the new block body
  let returnStatement;

  if (hasParentheses) {
    // Only wrap in parentheses if they were originally present
    const returnedIndent = `${bodyIndent}  `;
    const movedBodyText = moveBodyLines(
      sourceCode,
      arrowFunc.body,
      actualBodyText,
      arrowEnd,
      returnedIndent,
    );
    returnStatement = `return (\n${returnedIndent}${movedBodyText}\n${bodyIndent});`;
  } else {
    const movedBodyText = moveBodyLines(
      sourceCode,
      arrowFunc.body,
      actualBodyText,
      arrowEnd,
      bodyIndent,
    );
    returnStatement = `return ${movedBodyText};`;
  }

  const newBody = ` {\n${bodyIndent}${indentLogLines(normalized, bodyIndent)}\n${bodyIndent}${returnStatement}\n${indent}}`;

  return {
    start: arrowFunc.start,
    end: arrowFunc.end,
    text: beforeArrow + newBody,
  };
}
