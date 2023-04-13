import { DebugMessage } from '../../debug-message';
import { ExtensionProperties } from './extensionProperties';

export type Command = {
  name: string;
  handler: (
    extensionProperties: ExtensionProperties,
    debugMessage: DebugMessage,
    args?: unknown[],
  ) => Promise<void>;
};
