import * as vscode from 'vscode';
import { listenToFileOpeningNotifications } from '@/helpers/listenToFileOpeningNotifications';
import { NotificationEventHandler } from '@/helpers/notificationEventHandler';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('vscode');

describe('listenToFileOpeningNotifications', () => {
  let context: vscode.ExtensionContext;
  let onDidChangeActiveTextEditorCallback: (
    editor: vscode.TextEditor | undefined,
  ) => Promise<void>;
  let mockDisposable: vscode.Disposable;

  beforeEach(() => {
    jest.clearAllMocks();

    context = makeExtensionContext();
    mockDisposable = {
      dispose: jest.fn(),
    };

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    (vscode.window.onDidChangeActiveTextEditor as jest.Mock) = jest.fn(
      (callback) => {
        onDidChangeActiveTextEditorCallback = callback;
        return mockDisposable;
      },
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const makeHandler = (
    id: string,
    overrides: Partial<NotificationEventHandler> = {},
  ): NotificationEventHandler => ({
    id,
    shouldRegister: jest.fn(() => true),
    shouldProcess: jest.fn(() => true),
    process: jest.fn(async () => false),
    ...overrides,
  });

  it('should skip listener registration when no handlers pass shouldRegister', () => {
    const handlers: NotificationEventHandler[] = [
      makeHandler('h1', { shouldRegister: jest.fn(() => false) }),
      makeHandler('h2', { shouldRegister: jest.fn(() => false) }),
    ];

    listenToFileOpeningNotifications(context, '3.20.0', handlers);

    expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
    expect(context.subscriptions).toHaveLength(0);
  });

  it('should register one listener and push it to subscriptions when at least one handler is active', () => {
    const activeHandler = makeHandler('active');
    const inactiveHandler = makeHandler('inactive', {
      shouldRegister: jest.fn(() => false),
    });

    listenToFileOpeningNotifications(context, '3.20.0', [
      activeHandler,
      inactiveHandler,
    ]);

    expect(activeHandler.shouldRegister).toHaveBeenCalledWith(context);
    expect(inactiveHandler.shouldRegister).toHaveBeenCalledWith(context);
    expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
    expect(context.subscriptions).toHaveLength(1);
    expect(context.subscriptions[0]).toBe(mockDisposable);
  });

  it('should process only handlers that match the editor and keep unfinished handlers active', async () => {
    const removedHandler = makeHandler('removed', {
      process: jest.fn(async () => true),
    });
    const persistentHandler = makeHandler('persistent', {
      process: jest.fn(async () => false),
    });

    listenToFileOpeningNotifications(context, '3.20.0', [
      removedHandler,
      persistentHandler,
    ]);

    const mockEditor = {
      document: { fileName: 'test.ts' } as vscode.TextDocument,
    } as vscode.TextEditor;

    await onDidChangeActiveTextEditorCallback(mockEditor);

    expect(removedHandler.shouldProcess).toHaveBeenCalledWith(
      mockEditor,
      context,
    );
    expect(removedHandler.process).toHaveBeenCalledTimes(1);
    expect(persistentHandler.process).toHaveBeenCalledTimes(1);
    expect(mockDisposable.dispose).not.toHaveBeenCalled();

    await onDidChangeActiveTextEditorCallback(mockEditor);

    // Removed handler should not run again.
    expect(removedHandler.process).toHaveBeenCalledTimes(1);
    expect(persistentHandler.process).toHaveBeenCalledTimes(2);
  });

  it('should dispose listener when last remaining handler completes', async () => {
    const completedHandler = makeHandler('done', {
      process: jest.fn(async () => true),
    });

    listenToFileOpeningNotifications(context, '3.20.0', [completedHandler]);

    const mockEditor = {
      document: { fileName: 'test.ts' } as vscode.TextDocument,
    } as vscode.TextEditor;

    await onDidChangeActiveTextEditorCallback(mockEditor);

    expect(completedHandler.process).toHaveBeenCalledTimes(1);
    expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
  });

  it('should remove handler when it throws and avoid retrying it', async () => {
    const throwingHandler = makeHandler('throwing', {
      shouldProcess: jest.fn(() => {
        throw new Error('boom');
      }),
    });

    listenToFileOpeningNotifications(context, '3.20.0', [throwingHandler]);

    const mockEditor = {
      document: { fileName: 'test.ts' } as vscode.TextDocument,
    } as vscode.TextEditor;

    await onDidChangeActiveTextEditorCallback(mockEditor);
    await onDidChangeActiveTextEditorCallback(mockEditor);

    expect(throwingHandler.shouldProcess).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
    expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
  });

  it('should ignore handlers that throw during shouldRegister and still register valid handlers', () => {
    const brokenHandler = makeHandler('broken', {
      shouldRegister: jest.fn(() => {
        throw new Error('register failure');
      }),
    });
    const validHandler = makeHandler('valid');

    listenToFileOpeningNotifications(context, '3.20.0', [
      brokenHandler,
      validHandler,
    ]);

    expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
    expect(validHandler.shouldRegister).toHaveBeenCalledWith(context);
  });
});
