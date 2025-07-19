import { jsDebugMessage } from '@/debug-message/js/JSDebugMessage/JSDebugMessage';
import { msg } from '@/debug-message/js/JSDebugMessage/msg';
import { logMessage } from '@/debug-message/js/JSDebugMessage/logMessage';
import { enclosingBlockName } from '@/debug-message/js/JSDebugMessage/enclosingBlockName';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll';
import { makeTextDocument, createMockTextEditorEdit } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties, LogMessage, LogMessageType, BlockType, Message } from '@/entities';
import { LogType } from '@/entities/extension/extensionProperties';
import { Range } from 'vscode';

// Mock all imported functions
jest.mock('@/debug-message/js/JSDebugMessage/msg');
jest.mock('@/debug-message/js/JSDebugMessage/logMessage');
jest.mock('@/debug-message/js/JSDebugMessage/enclosingBlockName');
jest.mock('@/debug-message/js/JSDebugMessage/detectAll');

describe('JSDebugMessage', () => {
  // Mock functions
  const mockMsg = msg as jest.MockedFunction<typeof msg>;
  const mockLogMessage = logMessage as jest.MockedFunction<typeof logMessage>;
  const mockEnclosingBlockName = enclosingBlockName as jest.MockedFunction<typeof enclosingBlockName>;
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
    logType: LogType.log,
    logMessagePrefix: '',
    delimiterInsideMessage: ' ',
  } as ExtensionProperties;

  const mockLogMsg: LogMessage = {
    logMessageType: LogMessageType.PrimitiveAssignment,
  };

  const mockMessages: Message[] = [
    { spaces: '  ', lines: [new Range(0, 0, 1, 0)] }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock return values
    mockLogMessage.mockReturnValue(mockLogMsg);
    mockEnclosingBlockName.mockReturnValue('functionName');
    mockDetectAll.mockReturnValue(mockMessages);
  });

  describe('msg', () => {
    it('should delegate to the imported msg function with all parameters', () => {
      jsDebugMessage.msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties
      );

      expect(mockMsg).toHaveBeenCalledTimes(1);
      expect(mockMsg).toHaveBeenCalledWith(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties
      );
    });

    it('should not return anything (void function)', () => {
      const result = jsDebugMessage.msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties
      );

      expect(result).toBeUndefined();
    });
  });

  describe('logMessage', () => {
    it('should delegate to the imported logMessage function with correct parameters', () => {
      const selectionLine = 5;
      
      const result = jsDebugMessage.logMessage(
        mockDocument,
        selectionLine,
        selectedVar
      );

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
      expect(mockLogMessage).toHaveBeenCalledWith(
        mockDocument,
        selectionLine,
        selectedVar
      );
      expect(result).toBe(mockLogMsg);
    });

    it('should return the result from the imported logMessage function', () => {
      const customLogMsg: LogMessage = {
        logMessageType: LogMessageType.FunctionCallAssignment,
        metadata: { functionName: 'test' }
      };
      mockLogMessage.mockReturnValue(customLogMsg);

      const result = jsDebugMessage.logMessage(mockDocument, 0, selectedVar);

      expect(result).toBe(customLogMsg);
      expect(result).toEqual({
        logMessageType: LogMessageType.FunctionCallAssignment,
        metadata: { functionName: 'test' }
      });
    });
  });

  describe('enclosingBlockName', () => {
    it('should delegate to the imported enclosingBlockName function with correct parameters', () => {
      const blockType: BlockType = 'function';
      
      const result = jsDebugMessage.enclosingBlockName(
        mockDocument,
        lineOfSelectedVar,
        blockType
      );

      expect(mockEnclosingBlockName).toHaveBeenCalledTimes(1);
      expect(mockEnclosingBlockName).toHaveBeenCalledWith(
        mockDocument,
        lineOfSelectedVar,
        blockType
      );
      expect(result).toBe('functionName');
    });

    it('should return the result from the imported enclosingBlockName function', () => {
      const customBlockName = 'customClassName';
      mockEnclosingBlockName.mockReturnValue(customBlockName);

      const result = jsDebugMessage.enclosingBlockName(
        mockDocument,
        lineOfSelectedVar,
        'class'
      );

      expect(result).toBe(customBlockName);
    });
  });

  describe('detectAll', () => {
    it('should delegate to the imported detectAll function with all parameters', () => {
      const args = ['arg1', 'arg2'];
      
      const result = jsDebugMessage.detectAll(
        mockDocument,
        extensionProperties.logFunction,
        extensionProperties.logType,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
        args
      );

      expect(mockDetectAll).toHaveBeenCalledTimes(1);
      expect(mockDetectAll).toHaveBeenCalledWith(
        mockDocument,
        extensionProperties.logFunction,
        extensionProperties.logType,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
        args
      );
      expect(result).toBe(mockMessages);
    });

    it('should handle optional args parameter', () => {
      const result = jsDebugMessage.detectAll(
        mockDocument,
        'console.log',
        LogType.log,
        'DEBUG:',
        ' | '
      );

      expect(mockDetectAll).toHaveBeenCalledTimes(1);
      expect(mockDetectAll).toHaveBeenCalledWith(
        mockDocument,
        'console.log',
        LogType.log,
        'DEBUG:',
        ' | ',
        undefined
      );
      expect(result).toBe(mockMessages);
    });

    it('should return the result from the imported detectAll function', () => {
      const customMessages: Message[] = [
        { spaces: '    ', lines: [new Range(2, 0, 3, 0)] },
        { spaces: '  ', lines: [new Range(5, 0, 6, 0)] }
      ];
      mockDetectAll.mockReturnValue(customMessages);

      const result = jsDebugMessage.detectAll(
        mockDocument,
        'console.debug',
        LogType.debug,
        'TEST:',
        ' - '
      );

      expect(result).toBe(customMessages);
      expect(result).toHaveLength(2);
    });
  });

  describe('interface compliance', () => {
    it('should implement all required DebugMessage interface methods', () => {
      expect(typeof jsDebugMessage.msg).toBe('function');
      expect(typeof jsDebugMessage.logMessage).toBe('function');
      expect(typeof jsDebugMessage.enclosingBlockName).toBe('function');
      expect(typeof jsDebugMessage.detectAll).toBe('function');
    });

    it('should have the correct method signatures', () => {
      // Test that methods exist and can be called (already tested above)
      // This test serves as documentation of the interface
      expect(jsDebugMessage.msg).toBeDefined();
      expect(jsDebugMessage.logMessage).toBeDefined();
      expect(jsDebugMessage.enclosingBlockName).toBeDefined();
      expect(jsDebugMessage.detectAll).toBeDefined();
    });
  });
});
