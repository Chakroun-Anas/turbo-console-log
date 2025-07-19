import { insertDebugMessage } from '@/debug-message/js/JSDebugMessage/msg/insertDebugMessage';
import { Position } from 'vscode';
import { makeTextDocument, createMockTextEditorEdit } from '@/jest-tests/mocks/helpers';

// Mock VS Code Position
jest.mock('vscode', () => ({
  Position: jest.fn().mockImplementation((line, character) => ({ line, character }))
}));

describe('insertDebugMessage', () => {
  const mockPosition = Position as jest.MockedClass<typeof Position>;
  let mockTextEditor: ReturnType<typeof createMockTextEditorEdit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTextEditor = createMockTextEditorEdit();
  });

  describe('basic insertion', () => {
    it('should insert debug message at specified line', () => {
      const document = makeTextDocument(['const x = 1;', 'const y = 2;']);
      const debuggingMsg = 'console.log("x:", x);';
      
      insertDebugMessage(document, mockTextEditor, 1, debuggingMsg, false, false);

      expect(mockPosition).toHaveBeenCalledWith(1, 0);
      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        { line: 1, character: 0 },
        'console.log("x:", x);\n'
      );
    });

    it('should insert debug message with proper newline termination', () => {
      const document = makeTextDocument(['const value = 42;']);
      const debuggingMsg = 'console.log("value:", value);';
      
      insertDebugMessage(document, mockTextEditor, 0, debuggingMsg, false, false);

      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        expect.any(Object),
        'console.log("value:", value);\n'
      );
    });
  });

  describe('line boundary handling', () => {
    it('should handle insertion at line 0', () => {
      const document = makeTextDocument(['const x = 1;', 'const y = 2;']);
      const debuggingMsg = 'console.log("start");';
      
      insertDebugMessage(document, mockTextEditor, 0, debuggingMsg, false, false);

      expect(mockPosition).toHaveBeenCalledWith(0, 0);
      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        { line: 0, character: 0 },
        'console.log("start");\n'
      );
    });

    it('should handle insertion at last line', () => {
      const document = makeTextDocument(['const x = 1;', 'const y = 2;']);
      const lastLine = document.lineCount - 1;
      const debuggingMsg = 'console.log("end");';
      
      insertDebugMessage(document, mockTextEditor, lastLine, debuggingMsg, false, false);

      expect(mockPosition).toHaveBeenCalledWith(lastLine, 0);
    });

    it('should add extra newline when inserting at document end', () => {
      const document = makeTextDocument(['const x = 1;', 'const y = 2;']);
      const atEnd = document.lineCount;
      const debuggingMsg = 'console.log("at end");';
      
      insertDebugMessage(document, mockTextEditor, atEnd, debuggingMsg, false, false);

      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        expect.any(Object),
        '\nconsole.log("at end");\n'
      );
    });
  });

  describe('complex scenarios', () => {
    it('should handle empty document', () => {
      const document = makeTextDocument([]);
      const debuggingMsg = 'console.log("empty doc");';
      
      insertDebugMessage(document, mockTextEditor, 0, debuggingMsg, false, false);

      expect(mockPosition).toHaveBeenCalledWith(0, 0);
      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        { line: 0, character: 0 },
        '\nconsole.log("empty doc");\n'
      );
    });

    it('should handle single line document with insertion at end', () => {
      const document = makeTextDocument(['const x = 1;']);
      const debuggingMsg = 'console.log("x:", x);';
      
      insertDebugMessage(document, mockTextEditor, 1, debuggingMsg, false, false);

      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        expect.any(Object),
        '\nconsole.log("x:", x);\n'
      );
    });

    it('should handle complex debug message with special characters', () => {
      const document = makeTextDocument(['const obj = { key: "value" };']);
      const debuggingMsg = 'console.log("🚀 obj:", JSON.stringify(obj, null, 2));';
      
      insertDebugMessage(document, mockTextEditor, 1, debuggingMsg, true, true);

      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        expect.any(Object),
        '\n\nconsole.log("🚀 obj:", JSON.stringify(obj, null, 2));\n\n'
      );
    });

    it('should handle multiline debug message', () => {
      const document = makeTextDocument(['const data = getData();']);
      const debuggingMsg = 'console.log("data:", {\n  value: data,\n  type: typeof data\n});';
      
      insertDebugMessage(document, mockTextEditor, 1, debuggingMsg, false, false);

      expect(mockTextEditor.insert).toHaveBeenCalledWith(
        expect.any(Object),
        '\nconsole.log("data:", {\n  value: data,\n  type: typeof data\n});\n'
      );
    });
  });

  describe('position calculation', () => {
    it('should always insert at character 0 regardless of line content', () => {
      const document = makeTextDocument(['    const indented = true;']);
      const debuggingMsg = 'console.log("indented:", indented);';
      
      insertDebugMessage(document, mockTextEditor, 0, debuggingMsg, false, false);

      expect(mockPosition).toHaveBeenCalledWith(0, 0);
    });

    it('should clamp line number to document line count when beyond bounds', () => {
      const document = makeTextDocument(['line1', 'line2', 'line3']);
      const debuggingMsg = 'console.log("test");';
      
      insertDebugMessage(document, mockTextEditor, 999, debuggingMsg, false, false);

      expect(mockPosition).toHaveBeenCalledWith(document.lineCount, 0);
    });
  });
});
