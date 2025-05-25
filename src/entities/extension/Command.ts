import * as vscode from 'vscode';

import { DebugMessage } from '../../debug-message';
import { ExtensionProperties } from './extensionProperties';

type CommandHandlerProperties = {
  context: vscode.ExtensionContext;
  extensionProperties: ExtensionProperties;
  debugMessage: DebugMessage;
  args?: unknown[];
};

export type Command = {
  name: string;
  handler: (
    commandHandlerProperties: CommandHandlerProperties,
  ) => Promise<void>;
};
