import { getAllCommands } from '@/commands';
import type { Command } from '@/entities';

// Mock each command function
jest.mock('@/commands/insertConsoleLog', () => ({
  insertConsoleLogCommand: () => ({
    name: 'turboConsoleLog.insertConsoleLog',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/insertConsoleDebug', () => ({
  insertConsoleDebugCommand: () => ({
    name: 'turboConsoleLog.insertConsoleDebug',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/insertConsoleTable', () => ({
  insertConsoleTableCommand: () => ({
    name: 'turboConsoleLog.insertConsoleTable',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/insertConsoleInfo', () => ({
  insertConsoleInfoCommand: () => ({
    name: 'turboConsoleLog.insertConsoleInfo',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/insertConsoleWarn', () => ({
  insertConsoleWarnCommand: () => ({
    name: 'turboConsoleLog.insertConsoleWarn',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/insertConsoleError', () => ({
  insertConsoleErrorCommand: () => ({
    name: 'turboConsoleLog.insertConsoleError',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/insertCustomLog', () => ({
  insertCustomLogCommand: () => ({
    name: 'turboConsoleLog.insertCustomLog',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/commentAllLogMessages', () => ({
  commentAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.commentAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/uncommentAllLogMessages', () => ({
  uncommentAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/deleteAllLogMessages', () => ({
  deleteAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.deleteAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/correctAllLogMessages', () => ({
  correctAllLogMessagesCommand: () => ({
    name: 'turboConsoleLog.correctAllLogMessages',
    handler: jest.fn(),
  }),
}));

jest.mock('@/commands/activateTurboProBundle', () => ({
  activateTurboProBundleCommand: () => ({
    name: 'turboConsoleLog.activatePro',
    handler: jest.fn(),
  }),
}));

describe('getAllCommands', () => {
  test('should return all expected commands', () => {
    const commands = getAllCommands();

    const expectedNames = [
      'turboConsoleLog.insertConsoleLog',
      'turboConsoleLog.insertConsoleDebug',
      'turboConsoleLog.insertConsoleTable',
      'turboConsoleLog.insertConsoleInfo',
      'turboConsoleLog.insertConsoleWarn',
      'turboConsoleLog.displayLogMessage',
      'turboConsoleLog.insertConsoleError',
      'turboConsoleLog.insertCustomLog',
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
