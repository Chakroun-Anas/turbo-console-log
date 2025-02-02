import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';
import { showNotification } from '../ui';

function getFilenameFromLogMessage(
  logMessage: string,
  delimiterInsideMessage: string,
): string | null {
  const regex = new RegExp(
    `[\\s\\S]*?${delimiterInsideMessage}\\s([\\w.-]+\\.\\w+)`,
  );
  const match = logMessage.match(regex);
  return match ? match[1] : null;
}

export function correctAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.correctAllLogMessages',
    handler: async (
      extensionProperties: ExtensionProperties,
      jsDebugMessage: DebugMessage,
    ) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document: vscode.TextDocument = editor.document;
      const currentFileName = document.fileName.includes('/')
        ? document.fileName.split('/').pop()
        : document.fileName.split('\\').pop();

      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        extensionProperties.logFunction,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
      );

      const edits: { range: vscode.Range; newText: string }[] = [];
      let updatedCount = 0;

      editor
        .edit((editBuilder) => {
          logMessages.forEach(({ lines }) => {
            lines.forEach((line: vscode.Range) => {
              const lineText = document.getText(line);

              // Parse file name and line number from log messages using detectAll output
              const includeFilename = extensionProperties.includeFilename;
              const includeLineNum = extensionProperties.includeLineNum;

              // Extract current log message details
              const currentLine = line.start.line + 1;

              // Build the corrected log message based on user settings
              let correctedLog = lineText;
              let needsUpdate = false;

              if (includeFilename && currentFileName) {
                const extractedFilename = getFilenameFromLogMessage(
                  lineText,
                  extensionProperties.delimiterInsideMessage,
                );
                if (!lineText.includes(currentFileName) && extractedFilename) {
                  correctedLog = correctedLog.replace(
                    extractedFilename,
                    currentFileName,
                  );
                  needsUpdate = true;
                }
              }

              if (includeLineNum) {
                // Replace the line number if necessary
                const regexLineNum = new RegExp(`:\\d+`);
                const currentLineInfo = `:${currentLine}`;
                if (!lineText.includes(currentLineInfo)) {
                  correctedLog = correctedLog.replace(
                    regexLineNum,
                    currentLineInfo,
                  );
                  needsUpdate = true;
                }
              }
              if (needsUpdate && lineText !== correctedLog) {
                edits.push({ range: line, newText: correctedLog });
                updatedCount++;
              }
            });
          });

          // Apply the edits
          edits.forEach(({ range, newText }) =>
            editBuilder.replace(range, newText),
          );
        })
        .then(() => {
          if (edits.length !== 0) {
            showNotification(
              `${updatedCount} log messages have been updated`,
              5000,
            );
          }
        });
    },
  };
}
