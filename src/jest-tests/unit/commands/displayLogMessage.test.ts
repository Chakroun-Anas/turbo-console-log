import * as vscode from 'vscode';
import { displayLogMessageCommand } from '@/commands/displayLogMessage';
import { insertForSelections } from '@/commands/commandRuntime';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { makeTextEditor } from '@/jest-tests/mocks/helpers/makeTextEditor';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { trackLogInsertions } from '@/helpers/trackLogInsertions';

jest.mock('@/commands/commandRuntime', () => ({
  insertForSelections: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/utilities', () => ({
  getTabSize: () => 2,
}));

jest.mock('@/helpers/trackLogInsertions', () => ({
  trackLogInsertions: jest.fn(),
}));

const mockInsertForSelections = insertForSelections as jest.MockedFunction<
  typeof insertForSelections
>;
const mockTrackLogInsertions = trackLogInsertions as jest.MockedFunction<
  typeof trackLogInsertions
>;

describe('displayLogMessageCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    vscode.window.activeTextEditor = undefined;
  });

  it('does nothing when no editor is active', async () => {
    vscode.window.activeTextEditor = undefined;

    await displayLogMessageCommand().handler({
      context: makeExtensionContext(),
      extensionProperties: {} as ExtensionProperties,
    });

    expect(mockInsertForSelections).not.toHaveBeenCalled();
    expect(mockTrackLogInsertions).not.toHaveBeenCalled();
  });

  it('calls insertForSelections with the log type', async () => {
    const extensionProperties = {} as ExtensionProperties;
    const editor = makeTextEditor({
      document: makeTextDocument(['const myVar = 1;']),
    });
    vscode.window.activeTextEditor = editor;

    await displayLogMessageCommand().handler({
      context: makeExtensionContext(),
      extensionProperties,
    });

    expect(mockInsertForSelections).toHaveBeenCalledWith(
      editor,
      extensionProperties,
      'log',
      2,
    );
  });

  it('tracks the insertion after a successful call', async () => {
    const context = makeExtensionContext();
    vscode.window.activeTextEditor = makeTextEditor({
      document: makeTextDocument(['const myVar = 1;']),
    });

    await displayLogMessageCommand().handler({
      context,
      extensionProperties: {} as ExtensionProperties,
    });

    expect(mockTrackLogInsertions).toHaveBeenCalledWith(context);
  });
});
