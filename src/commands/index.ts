import { displayLogMessageCommand } from './displayLogMessage';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import { updateAllLogMessagesCommand } from './updateAllLogMessages';
import { updateLogMessagesCommand } from './updateLogMessageComment';
import { Command } from '../entities';

export function getAllCommands(): Array<Command> {
  return [
    displayLogMessageCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
    updateAllLogMessagesCommand(),
    updateLogMessagesCommand(),
  ];
}
