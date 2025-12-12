import { Range } from 'vscode';

export type Message = {
  spaces: string;
  lines: Range[];
  isCommented?: boolean; // Optional property to indicate if the message is commented
  logFunction?: string; // The log function used (e.g., 'console.log', 'console.warn', 'console.error')
  isTurboConsoleLog?: boolean; // Indicates if the log was inserted by Turbo Console Log (contains prefix and delimiter)
};
