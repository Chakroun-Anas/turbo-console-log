import * as vscode from 'vscode';
import { insertForSelections } from '@/commands/commandRuntime';
import {
  resolveDebugRuntime,
  type SupportedRuntimeLanguage,
} from '@/helpers/resolveDebugRuntime';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { makeDebugMessage } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';

// We isolate resolveDebugRuntime so we can control the resolved language while
// still exercising the real resolveLogFunctionForRuntime mapping logic.
jest.mock('@/helpers/resolveDebugRuntime', () => {
  const actual = jest.requireActual('@/helpers/resolveDebugRuntime');
  return { ...actual, resolveDebugRuntime: jest.fn() };
});

const mockResolveDebugRuntime = resolveDebugRuntime as jest.MockedFunction<
  typeof resolveDebugRuntime
>;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function makeEditorWithSelections(
  lines: string[],
  selections: vscode.Selection[],
) {
  const document = makeTextDocument(lines);
  const editBuilder = createMockTextEditorEdit();
  const editor = makeTextEditor({ document, selections });
  editor.edit = jest.fn().mockImplementation((cb) => {
    cb(editBuilder);
    return Promise.resolve(true);
  });
  return { editor, document, editBuilder };
}

function stubLanguage(
  language: SupportedRuntimeLanguage,
  debugMessage: ReturnType<typeof makeDebugMessage>,
) {
  mockResolveDebugRuntime.mockReturnValue({
    language,
    commentPrefix: language === 'python' ? '#' : '//',
    debugMessage,
  });
}

const sel = (
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number,
) =>
  new vscode.Selection(
    new vscode.Position(startLine, startChar),
    new vscode.Position(endLine, endChar),
  );

const noProps = {} as ExtensionProperties;

// ------------------------------------------------------------------

describe('insertForSelections', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('selection handling', () => {
    beforeEach(() => {
      // language doesn't matter for these tests — use JS
      stubLanguage('javascript', makeDebugMessage());
    });

    it('skips when nothing is selected and no word is under the cursor', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor } = makeEditorWithSelections([''], [sel(0, 0, 0, 0)]);

      await insertForSelections(editor, noProps, 'log', 2);

      expect(debugMessage.msg).not.toHaveBeenCalled();
    });

    it('uses the selected text as the variable', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor, document, editBuilder } = makeEditorWithSelections(
        ['const myVar = 42;'],
        [sel(0, 6, 0, 11)],
      );

      await insertForSelections(editor, noProps, 'log', 2);

      expect(debugMessage.msg).toHaveBeenCalledWith(
        editBuilder,
        document,
        'myVar',
        0,
        2,
        noProps,
        'log',
      );
    });

    it('falls back to the word under the cursor when the selection is collapsed', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor, document, editBuilder } = makeEditorWithSelections(
        ['const myVariable = 123;'],
        [sel(0, 9, 0, 9)],
      );

      await insertForSelections(editor, noProps, 'log', 2);

      expect(debugMessage.msg).toHaveBeenCalledWith(
        editBuilder,
        document,
        'myVariable',
        0,
        2,
        noProps,
        'log',
      );
    });

    it('processes each non-empty selection independently', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor, document, editBuilder } = makeEditorWithSelections(
        ['const firstVar = 1;', 'const secondVar = 2;'],
        [sel(0, 6, 0, 14), sel(1, 6, 1, 15)],
      );

      await insertForSelections(editor, noProps, 'log', 2);

      expect(debugMessage.msg).toHaveBeenCalledTimes(2);
      expect(debugMessage.msg).toHaveBeenNthCalledWith(
        1,
        editBuilder,
        document,
        'firstVar',
        0,
        2,
        noProps,
        'log',
      );
      expect(debugMessage.msg).toHaveBeenNthCalledWith(
        2,
        editBuilder,
        document,
        'secondVar',
        1,
        2,
        noProps,
        'log',
      );
    });

    it('skips blank selections in a multi-selection batch', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor } = makeEditorWithSelections(
        ['const myVar = 1;', ''],
        [sel(0, 6, 0, 11), sel(1, 0, 1, 0)],
      );

      await insertForSelections(editor, noProps, 'log', 2);

      expect(debugMessage.msg).toHaveBeenCalledTimes(1);
    });

    it('returns true', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor } = makeEditorWithSelections(
        ['const myVar = 42;'],
        [sel(0, 6, 0, 11)],
      );

      const result = await insertForSelections(
        editor,
        noProps,
        'log',
        2,
      );

      expect(result).toBe(true);
    });
  });

  describe('log function resolution', () => {
    describe('javascript', () => {
      it.each([
        ['log', 'log'],
        ['debug', 'debug'],
        ['info', 'info'],
        ['warn', 'warn'],
        ['error', 'error'],
        ['table', 'table'],
      ] as const)(
        'passes %s through as the function name',
        async (logType, expectedFn) => {
          const debugMessage = makeDebugMessage();
          stubLanguage('javascript', debugMessage);
          const { editor, document, editBuilder } = makeEditorWithSelections(
            ['const myVar = 1;'],
            [sel(0, 6, 0, 11)],
          );

          await insertForSelections(editor, noProps, logType, 2);

          expect(debugMessage.msg).toHaveBeenCalledWith(
            editBuilder, document, 'myVar', 0, 2, noProps, expectedFn,
          );
        },
      );

      it('uses the custom logFunction for the custom type', async () => {
        const debugMessage = makeDebugMessage();
        stubLanguage('javascript', debugMessage);
        const { editor, document, editBuilder } = makeEditorWithSelections(
          ['const myVar = 1;'],
          [sel(0, 6, 0, 11)],
        );
        const props = { logFunction: 'logger.info' } as ExtensionProperties;

        await insertForSelections(editor, props, 'custom', 2);

        expect(debugMessage.msg).toHaveBeenCalledWith(
          editBuilder, document, 'myVar', 0, 2, props, 'logger.info',
        );
      });

      it('falls back to log for custom type when logFunction is not set', async () => {
        const debugMessage = makeDebugMessage();
        stubLanguage('javascript', debugMessage);
        const { editor, document, editBuilder } = makeEditorWithSelections(
          ['const myVar = 1;'],
          [sel(0, 6, 0, 11)],
        );

        await insertForSelections(editor, noProps, 'custom', 2);

        expect(debugMessage.msg).toHaveBeenCalledWith(
          editBuilder, document, 'myVar', 0, 2, noProps, 'log',
        );
      });
    });

    describe('python', () => {
      it.each([
        ['log', 'print'],
        ['table', 'print'],
        ['debug', 'logging.debug'],
        ['info', 'logging.info'],
        ['warn', 'logging.warning'],
        ['error', 'logging.error'],
      ] as const)(
        'maps %s to %s',
        async (logType, expectedFn) => {
          const debugMessage = makeDebugMessage();
          stubLanguage('python', debugMessage);
          const { editor, document, editBuilder } = makeEditorWithSelections(
            ['value = 1'],
            [sel(0, 0, 0, 5)],
          );

          await insertForSelections(editor, noProps, logType, 2);

          expect(debugMessage.msg).toHaveBeenCalledWith(
            editBuilder, document, 'value', 0, 2, noProps, expectedFn,
          );
        },
      );

      it('uses the custom logFunction for the custom type', async () => {
        const debugMessage = makeDebugMessage();
        stubLanguage('python', debugMessage);
        const { editor, document, editBuilder } = makeEditorWithSelections(
          ['value = 1'],
          [sel(0, 0, 0, 5)],
        );
        const props = { logFunction: 'my_logger' } as ExtensionProperties;

        await insertForSelections(editor, props, 'custom', 2);

        expect(debugMessage.msg).toHaveBeenCalledWith(
          editBuilder, document, 'value', 0, 2, props, 'my_logger',
        );
      });

      it('falls back to print for custom type when logFunction is the default log', async () => {
        const debugMessage = makeDebugMessage();
        stubLanguage('python', debugMessage);
        const { editor, document, editBuilder } = makeEditorWithSelections(
          ['value = 1'],
          [sel(0, 0, 0, 5)],
        );
        const props = { logFunction: 'log' } as ExtensionProperties;

        await insertForSelections(editor, props, 'custom', 2);

        expect(debugMessage.msg).toHaveBeenCalledWith(
          editBuilder, document, 'value', 0, 2, props, 'print',
        );
      });
    });

    describe('php', () => {
      it.each([
        ['log', 'var_dump'],
        ['info', 'print_r'],
        ['table', 'print_r'],
        ['debug', 'error_log'],
        ['warn', 'error_log'],
        ['error', 'error_log'],
      ] as const)(
        'maps %s to %s',
        async (logType, expectedFn) => {
          const debugMessage = makeDebugMessage();
          stubLanguage('php', debugMessage);
          const { editor, document, editBuilder } = makeEditorWithSelections(
            ['$myVar = 1;'],
            [sel(0, 0, 0, 6)],
          );

          await insertForSelections(editor, noProps, logType, 2);

          expect(debugMessage.msg).toHaveBeenCalledWith(
            editBuilder, document, '$myVar', 0, 2, noProps, expectedFn,
          );
        },
      );

      it('uses the custom logFunction for the custom type', async () => {
        const debugMessage = makeDebugMessage();
        stubLanguage('php', debugMessage);
        const { editor, document, editBuilder } = makeEditorWithSelections(
          ['$myVar = 1;'],
          [sel(0, 0, 0, 6)],
        );
        const props = { logFunction: 'my_logger' } as ExtensionProperties;

        await insertForSelections(editor, props, 'custom', 2);

        expect(debugMessage.msg).toHaveBeenCalledWith(
          editBuilder, document, '$myVar', 0, 2, props, 'my_logger',
        );
      });

      it('falls back to var_dump for custom type when logFunction is the default log', async () => {
        const debugMessage = makeDebugMessage();
        stubLanguage('php', debugMessage);
        const { editor, document, editBuilder } = makeEditorWithSelections(
          ['$myVar = 1;'],
          [sel(0, 0, 0, 6)],
        );
        const props = { logFunction: 'log' } as ExtensionProperties;

        await insertForSelections(editor, props, 'custom', 2);

        expect(debugMessage.msg).toHaveBeenCalledWith(
          editBuilder, document, '$myVar', 0, 2, props, 'var_dump',
        );
      });
    });

    it('uses log as the default logFunction when extensionProperties.logFunction is undefined', async () => {
      const debugMessage = makeDebugMessage();
      stubLanguage('javascript', debugMessage);
      const { editor, document, editBuilder } = makeEditorWithSelections(
        ['const myVar = 1;'],
        [sel(0, 6, 0, 11)],
      );
      const props = { logFunction: undefined } as unknown as ExtensionProperties;

      await insertForSelections(editor, props, 'custom', 2);

      expect(debugMessage.msg).toHaveBeenCalledWith(
        editBuilder, document, 'myVar', 0, 2, props, 'log',
      );
    });
  });
});
