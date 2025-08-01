import { insertConsoleLogCommand } from './insertConsoleLog';
import { insertConsoleDebugCommand } from './insertConsoleDebug';
import { insertConsoleTableCommand } from './insertConsoleTable';
import { insertConsoleWarnCommand } from './insertConsoleWarn';
import { insertCustomLogCommand } from './insertCustomLog';
import { insertConsoleInfoCommand } from './insertConsoleInfo';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import { correctAllLogMessagesCommand } from './correctAllLogMessages';
import { insertConsoleErrorCommand } from './insertConsoleError';
import { activateTurboProBundleCommand } from './activateTurboProBundle';
import { displayLogMessageCommand } from './displayLogMessage';
import { Command } from '../entities';
export function getAllCommands(): Array<Command> {
  return [
    insertConsoleLogCommand(),
    insertConsoleDebugCommand(),
    insertConsoleTableCommand(),
    insertConsoleInfoCommand(),
    insertConsoleWarnCommand(),
    displayLogMessageCommand(),
    insertConsoleErrorCommand(),
    insertCustomLogCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
    correctAllLogMessagesCommand(),
    activateTurboProBundleCommand(),
  ];
}
