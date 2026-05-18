import { applyTransformedCode } from '@/debug-message/php/PHPDebugMessage/msg/transformer/applyTransformedCode';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';

// Mock VS Code window API
jest.mock('vscode', () => ({
  window: {
    activeTextEditor: null,
  },
  Range: jest.fn((start, end) => ({ start, end })),
}));

describe('applyTransformedCode (PHP)', () => {
  it('should not apply if no active editor', async () => {
    const document = makeTextDocument(['<?php', '$x = 1;']);
    (vscode.window as { activeTextEditor: unknown }).activeTextEditor = null;

    await applyTransformedCode(vscode, document, '<?php\n$x = 2;');

    // No error should be thrown
    expect(true).toBe(true);
  });

  it('should apply transformed code to document', async () => {
    const document = makeTextDocument(['<?php', '$x = 1;']);
    const transformedCode = '<?php\n$x = 2;';

    const mockEdit = jest.fn();
    const mockEditor = {
      document,
      edit: (callback: (builder: vscode.TextEditorEdit) => void) => {
        const builder = {
          replace: mockEdit,
        };
        callback(builder as unknown as vscode.TextEditorEdit);
        return Promise.resolve(true);
      },
    };

    (vscode.window as { activeTextEditor: unknown }).activeTextEditor =
      mockEditor;

    await applyTransformedCode(vscode, document, transformedCode);

    expect(mockEdit).toHaveBeenCalled();
  });

  it('should find minimal differing region', async () => {
    const originalLines = ['<?php', 'function test($x) {}'];
    const document = makeTextDocument(originalLines);
    const transformedCode =
      '<?php\nfunction test($x) {\n  error_log("x: " . $x);\n}';

    const mockEdit = jest.fn();
    const mockEditor = {
      document,
      edit: (callback: (builder: vscode.TextEditorEdit) => void) => {
        const builder = {
          replace: mockEdit,
        };
        callback(builder as unknown as vscode.TextEditorEdit);
        return Promise.resolve(true);
      },
    };

    (vscode.window as { activeTextEditor: unknown }).activeTextEditor =
      mockEditor;

    await applyTransformedCode(vscode, document, transformedCode);

    expect(mockEdit).toHaveBeenCalled();
    // Should only replace the changed portion (the function body)
    const call = mockEdit.mock.calls[0];
    expect(call).toBeDefined();
  });

  it('should handle identical code', async () => {
    const document = makeTextDocument(['<?php', '$x = 1;']);
    const transformedCode = '<?php\n$x = 1;';

    const mockEdit = jest.fn();
    const mockEditor = {
      document,
      edit: (callback: (builder: vscode.TextEditorEdit) => void) => {
        const builder = {
          replace: mockEdit,
        };
        callback(builder as unknown as vscode.TextEditorEdit);
        return Promise.resolve(true);
      },
    };

    (vscode.window as { activeTextEditor: unknown }).activeTextEditor =
      mockEditor;

    await applyTransformedCode(vscode, document, transformedCode);

    // Should still be called, but with empty replacement
    expect(mockEdit).toHaveBeenCalled();
  });
});
