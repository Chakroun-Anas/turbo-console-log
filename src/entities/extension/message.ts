import { Range } from 'vscode';

export type Message = {
  spaces: string;
  lines: Range[];
  isCommented?: boolean; // Optional property to indicate if the message is commented
};
