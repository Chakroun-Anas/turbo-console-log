import { jsDebugMessage } from '@/debug-message/js/JSDebugMessage/JSDebugMessage';
import { msg } from '@/debug-message/js/JSDebugMessage/msg';
import { logMessage } from '@/debug-message/js/JSDebugMessage/msg/logMessage';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll';
import {
  makeTextDocument,
  createMockTextEditorEdit,
} from '@/jest-tests/mocks/helpers';
import {
  ExtensionProperties,
  LogMessage,
  LogMessageType,
  Message,
} from '@/entities';
import { Range } from 'vscode';
import * as fs from 'fs';
import * as vscode from 'vscode';

// Mock all imported functions
jest.mock('@/debug-message/js/JSDebugMessage/msg');
jest.mock('@/debug-message/js/JSDebugMessage/msg/logMessage');
jest.mock('@/debug-message/js/JSDebugMessage/detectAll');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('JSDebugMessage', () => {
  // Mock functions
  const mockMsg = msg as jest.MockedFunction<typeof msg>;
  const mockLogMessage = logMessage as jest.MockedFunction<typeof logMessage>;
  const mockDetectAll = detectAll as jest.MockedFunction<typeof detectAll>;

  // Test data
  const mockTextEditor = createMockTextEditorEdit();
  const mockDocument = makeTextDocument(['const value = 42;']);
  const selectedVar = 'value';
  const lineOfSelectedVar = 0;
  const tabSize = 2;
  const extensionProperties: ExtensionProperties = {
    wrapLogMessage: true,
    insertEmptyLineAfterLogMessage: true,
    insertEmptyLineBeforeLogMessage: false,
    addSemicolonInTheEnd: true,
    logFunction: 'console.log',
    logMessagePrefix: '',
    delimiterInsideMessage: ' ',
  } as ExtensionProperties;

  const mockLogMsg: LogMessage = {
    logMessageType: LogMessageType.PrimitiveAssignment,
  };

  const mockMessages: Message[] = [
    { spaces: '  ', lines: [new Range(0, 0, 1, 0)] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock return values
    mockLogMessage.mockReturnValue(mockLogMsg);
    mockDetectAll.mockResolvedValue(mockMessages);
  });

  describe('msg', () => {
    it('should delegate to the imported msg function with all parameters', () => {
      jsDebugMessage.msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockMsg).toHaveBeenCalledTimes(1);
      expect(mockMsg).toHaveBeenCalledWith(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );
    });

    it('should not return anything (void function)', () => {
      const result = jsDebugMessage.msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(result).toBeUndefined();
    });
  });

  describe('detectAll', () => {
    it('should delegate to the imported detectAll function with all parameters', async () => {
      const result = await jsDebugMessage.detectAll(
        fs,
        vscode,
        mockDocument.uri.fsPath,
        extensionProperties.logFunction,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
      );

      expect(mockDetectAll).toHaveBeenCalledTimes(1);
      expect(mockDetectAll).toHaveBeenCalledWith(
        fs,
        vscode,
        mockDocument.uri.fsPath,
        extensionProperties.logFunction,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
      );
      expect(result).toBe(mockMessages);
    });

    it('should return the result from the imported detectAll function', async () => {
      const customMessages: Message[] = [
        { spaces: '    ', lines: [new Range(2, 0, 3, 0)] },
        { spaces: '  ', lines: [new Range(5, 0, 6, 0)] },
      ];
      mockDetectAll.mockResolvedValue(customMessages);

      const result = await jsDebugMessage.detectAll(
        fs,
        vscode,
        mockDocument.uri.fsPath,
        'console.debug',
        'TEST:',
        ' - ',
      );

      expect(result).toBe(customMessages);
      expect(result).toHaveLength(2);
    });
  });

  describe('interface compliance', () => {
    it('should implement all required DebugMessage interface methods', () => {
      expect(typeof jsDebugMessage.msg).toBe('function');
      expect(typeof jsDebugMessage.detectAll).toBe('function');
    });

    it('should have the correct method signatures', () => {
      // Test that methods exist and can be called (already tested above)
      // This test serves as documentation of the interface
      expect(jsDebugMessage.msg).toBeDefined();
      expect(jsDebugMessage.detectAll).toBeDefined();
    });
  });
});
