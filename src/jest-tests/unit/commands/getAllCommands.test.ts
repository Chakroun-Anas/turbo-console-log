import { getAllCommands } from '../../../commands';
import type { Command } from '../../../entities';

// Mock each command function
jest.mock('../../../commands/displayLogMessage', () => ({
  displayLogMessageCommand: () => ({
    name: 'turboConsoleLog.displayLogMessage',
    handler: jest.fn(),
  }),
}));

jest.mock('../../../commands/commentAllLogMessages', () => ({
  commentAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.commentAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('../../../commands/uncommentAllLogMessages', () => ({
  uncommentAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('../../../commands/deleteAllLogMessages', () => ({
  deleteAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.deleteAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('../../../commands/correctAllLogMessages', () => ({
  correctAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.correctAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('../../../commands/activateTurboProBundle', () => ({
  activateTurboProBundleCommand: () => ({
    name: 'turboConsoleLog.activatePro',
    handler: jest.fn(),
  }),
}));

describe('getAllCommands', () => {
  test('should return all expected commands', () => {
    const commands = getAllCommands();

    const expectedNames = [
      'turboConsoleLog.displayLogMessage',
      'turboConsoleLog.commentAllLogMessages',
      'turboConsoleLog.uncommentAllLogMessages',
      'turboConsoleLog.deleteAllLogMessages',
      'turboConsoleLog.correctAllLogMessages',
      'turboConsoleLog.activatePro',
    ];

    expect(Array.isArray(commands)).toBe(true);

    const actualNames = commands.map((cmd: Command) => cmd.name);
    expect(actualNames).toEqual(expectedNames);

    commands.forEach((cmd) => {
      expect(typeof cmd.name).toBe('string');
      expect(typeof cmd.handler).toBe('function');
    });
  });
});
