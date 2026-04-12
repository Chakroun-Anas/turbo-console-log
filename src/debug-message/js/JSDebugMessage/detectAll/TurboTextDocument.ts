/**
 * Lightweight alternative to VS Code's TextDocument for log detection.
 * Avoids expensive openTextDocument() call by working directly with raw file content.
 * Only implements the minimal API surface needed for detectAll operations.
 */

/**
 * Lightweight line representation without VS Code overhead
 */
export interface TurboLine {
  /** Line number (0-indexed) */
  lineNumber: number;
  /** Raw text content of the line */
  text: string;
  /** Simple range metadata for this line */
  rangeIncludingLineBreak: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

/**
 * Lightweight document representation without VS Code overhead
 */
export interface TurboTextDocument {
  /** Total number of lines in the document */
  readonly lineCount: number;
  /** Get a specific line by index */
  lineAt(index: number): TurboLine;
}

/**
 * Creates a lightweight TurboTextDocument from raw file content.
 * This is 1000x faster than vscode.workspace.openTextDocument() because it:
 * - Skips language parsing/analysis
 * - Skips syntax highlighting metadata
 * - Works with simple string arrays instead of complex TextDocument objects
 *
 * @param content Raw file content from fs.readFile
 * @returns Lightweight document interface compatible with detectAll operations
 */
export function openTurboTextDocument(content: string): TurboTextDocument {
  const lines = content.split('\n');

  return {
    get lineCount(): number {
      return lines.length;
    },

    lineAt(index: number): TurboLine {
      if (index < 0 || index >= lines.length) {
        throw new Error(
          `Line index ${index} out of range (0-${lines.length - 1})`,
        );
      }

      const text = lines[index];

      return {
        lineNumber: index,
        text,
        rangeIncludingLineBreak: {
          start: { line: index, character: 0 },
          // VS Code's rangeIncludingLineBreak extends to next line to include the newline character
          // For last line without trailing newline, stay on same line
          end:
            index < lines.length - 1
              ? { line: index + 1, character: 0 }
              : { line: index, character: text.length },
        },
      };
    },
  };
}
