import { msg } from '@/debug-message/js/JSDebugMessage/msg';
import { logMessage } from '@/debug-message/js/JSDebugMessage/msg/logMessage';
import { line as logMessageLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine';
import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg';
import { constructDebuggingMsgContent } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent';
import { constructDebuggingMsg } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsg';
import { insertDebugMessage } from '@/debug-message/js/JSDebugMessage/msg/insertDebugMessage';
import {
  needTransformation,
  performTransformation,
  applyTransformedCode,
} from '@/debug-message/js/JSDebugMessage/msg/transformer';
import { omit } from '@/debug-message/js/JSDebugMessage/msg/helpers/omit';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { ExtensionProperties, LogMessage, LogMessageType } from '@/entities';
import * as vscode from 'vscode';

// Mock all dependencies
jest.mock('@/debug-message/js/JSDebugMessage/msg/logMessage');
jest.mock('@/debug-message/js/JSDebugMessage/msg/logMessageLine');
jest.mock('@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent');
jest.mock('@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsg');
jest.mock('@/debug-message/js/JSDebugMessage/msg/insertDebugMessage');
jest.mock('@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg');
jest.mock('@/debug-message/js/JSDebugMessage/msg/transformer');
jest.mock('@/debug-message/js/JSDebugMessage/msg/helpers/omit');
jest.mock('@/debug-message/js/JSDebugMessage/msg/acorn-utils');

describe('msg', () => {
  // Mock functions
  const mockParseCode = parseCode as jest.MockedFunction<typeof parseCode>;
  const mockLogMessage = logMessage as jest.MockedFunction<typeof logMessage>;
  const mockLogMessageLine = logMessageLine as jest.MockedFunction<
    typeof logMessageLine
  >;
  const mockSpacesBeforeLogMsg = spacesBeforeLogMsg as jest.MockedFunction<
    typeof spacesBeforeLogMsg
  >;
  const mockConstructDebuggingMsgContent =
    constructDebuggingMsgContent as jest.MockedFunction<
      typeof constructDebuggingMsgContent
    >;
  const mockConstructDebuggingMsg =
    constructDebuggingMsg as jest.MockedFunction<typeof constructDebuggingMsg>;
  const mockInsertDebugMessage = insertDebugMessage as jest.MockedFunction<
    typeof insertDebugMessage
  >;
  const mockNeedTransformation = needTransformation as jest.MockedFunction<
    typeof needTransformation
  >;
  const mockPerformTransformation =
    performTransformation as jest.MockedFunction<typeof performTransformation>;
  const mockApplyTransformedCode = applyTransformedCode as jest.MockedFunction<
    typeof applyTransformedCode
  >;
  const mockOmit = omit as jest.MockedFunction<typeof omit>;

  // Mock vscode.window.showErrorMessage
  const mockShowErrorMessage = jest.fn();

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
    // ... other properties would be here
  } as ExtensionProperties;

  const mockLogMsg: LogMessage = {
    logMessageType: LogMessageType.PrimitiveAssignment,
  };

  const mockAst = {
    type: 'Program',
    body: [],
    sourceType: 'module',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock vscode.window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vscode.window as any) = {
      showErrorMessage: mockShowErrorMessage,
    };

    // Set up default mock return values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockParseCode.mockReturnValue(mockAst as any);
    mockLogMessage.mockReturnValue(mockLogMsg);
    mockLogMessageLine.mockReturnValue(1);
    mockSpacesBeforeLogMsg.mockReturnValue('  ');
    mockConstructDebuggingMsgContent.mockReturnValue('value');
    mockConstructDebuggingMsg.mockReturnValue('console.log("value", value);');
    mockNeedTransformation.mockReturnValue(false);
    mockOmit.mockReturnValue({} as Partial<ExtensionProperties>);
  });

  describe('error handling', () => {
    it('should show error message and return early when parseCode throws an error', () => {
      const parseError = new Error('Unexpected token');
      mockParseCode.mockImplementation(() => {
        throw parseError;
      });

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockShowErrorMessage).toHaveBeenCalledWith(
        'Turbo AST: Unexpected token',
      );
      expect(mockLogMessage).not.toHaveBeenCalled();
      expect(mockInsertDebugMessage).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions when parseCode fails', () => {
      mockParseCode.mockImplementation(() => {
        throw 'String error';
      });

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockShowErrorMessage).toHaveBeenCalledWith(
        'Turbo AST: Unknown error',
      );
      expect(mockLogMessage).not.toHaveBeenCalled();
      expect(mockInsertDebugMessage).not.toHaveBeenCalled();
    });
  });

  describe('normal flow (no transformation needed)', () => {
    it('should orchestrate the full debug message generation process', () => {
      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      // Verify the orchestration flow
      expect(mockLogMessage).toHaveBeenCalledWith(
        expect.any(Object), // AST
        mockDocument,
        lineOfSelectedVar,
        selectedVar,
      );
      expect(mockLogMessageLine).toHaveBeenCalledWith(
        expect.any(Object), // AST
        mockDocument,
        lineOfSelectedVar,
        selectedVar,
        mockLogMsg,
      );
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledWith(
        mockDocument,
        lineOfSelectedVar,
        1,
      );
      expect(mockConstructDebuggingMsgContent).toHaveBeenCalled();
      expect(mockConstructDebuggingMsg).toHaveBeenCalled();
      expect(mockNeedTransformation).toHaveBeenCalledWith(
        expect.any(Object), // AST
        mockDocument,
        lineOfSelectedVar,
        selectedVar,
      );
      expect(mockInsertDebugMessage).toHaveBeenCalledWith(
        mockDocument,
        mockTextEditor,
        1,
        'console.log("value", value);',
        false, // insertEmptyLineBeforeLogMessage
        true, // insertEmptyLineAfterLogMessage
      );
    });

    it('should call omit with correct properties to exclude', () => {
      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockOmit).toHaveBeenCalledWith(extensionProperties, [
        'wrapLogMessage',
        'insertEmptyLineAfterLogMessage',
      ]);
    });

    it('should not call transformation functions when transformation is not needed', () => {
      mockNeedTransformation.mockReturnValue(false);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockPerformTransformation).not.toHaveBeenCalled();
      expect(mockApplyTransformedCode).not.toHaveBeenCalled();
      expect(mockInsertDebugMessage).toHaveBeenCalled();
    });
  });

  describe('transformation flow', () => {
    it('should use transformation path when transformation is needed', () => {
      mockNeedTransformation.mockReturnValue(true);
      const mockTransformedCode = 'transformed code';
      mockPerformTransformation.mockReturnValue(mockTransformedCode);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockNeedTransformation).toHaveBeenCalledWith(
        expect.any(Object), // AST
        mockDocument,
        lineOfSelectedVar,
        selectedVar,
      );
      expect(mockPerformTransformation).toHaveBeenCalledWith(
        expect.any(Object), // AST
        mockDocument,
        lineOfSelectedVar,
        selectedVar,
        'console.log("value", value);',
        {
          addSemicolonInTheEnd: true,
          tabSize: 2,
        },
      );
      expect(mockApplyTransformedCode).toHaveBeenCalledWith(
        mockDocument,
        mockTransformedCode,
      );
      expect(mockInsertDebugMessage).not.toHaveBeenCalled();
    });

    it('should return early after applying transformed code', () => {
      mockNeedTransformation.mockReturnValue(true);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockApplyTransformedCode).toHaveBeenCalled();
      expect(mockInsertDebugMessage).not.toHaveBeenCalled();
    });
  });

  describe('metadata handling', () => {
    it('should use deepObjectLine when metadata contains it', () => {
      const logMsgWithMetadata: LogMessage = {
        logMessageType: LogMessageType.PrimitiveAssignment,
        metadata: {
          deepObjectLine: 5,
          deepObjectPath: 'obj.prop',
        },
      };
      mockLogMessage.mockReturnValue(logMsgWithMetadata);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledWith(mockDocument, 5, 1);
      expect(mockConstructDebuggingMsgContent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Program' }), // AST object
        mockDocument,
        'obj.prop',
        lineOfSelectedVar,
        1,
        {},
        'log',
      );
    });

    it('should use original values when metadata is not present', () => {
      const logMsgWithoutMetadata: LogMessage = {
        logMessageType: LogMessageType.PrimitiveAssignment,
      };
      mockLogMessage.mockReturnValue(logMsgWithoutMetadata);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledWith(
        mockDocument,
        lineOfSelectedVar,
        1,
      );
      expect(mockConstructDebuggingMsgContent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Program' }), // AST object
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        1,
        {},
        'log',
      );
    });
  });

  describe('parameter passing', () => {
    it('should pass correct parameters to constructDebuggingMsg', () => {
      const mockContent = 'debug content';
      const mockSpaces = '    ';
      mockConstructDebuggingMsgContent.mockReturnValue(mockContent);
      mockSpacesBeforeLogMsg.mockReturnValue(mockSpaces);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockConstructDebuggingMsg).toHaveBeenCalledWith(
        extensionProperties,
        mockContent,
        mockSpaces,
        'log',
      );
    });

    it('should pass correct line numbers between functions', () => {
      const mockLineOfLogMsg = 3;
      mockLogMessageLine.mockReturnValue(mockLineOfLogMsg);

      msg(
        mockTextEditor,
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        tabSize,
        extensionProperties,
        'log',
      );

      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledWith(
        mockDocument,
        lineOfSelectedVar,
        mockLineOfLogMsg,
      );
      expect(mockConstructDebuggingMsgContent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Program' }), // AST object
        mockDocument,
        selectedVar,
        lineOfSelectedVar,
        mockLineOfLogMsg,
        {},
        'log',
      );
    });
  });
});
