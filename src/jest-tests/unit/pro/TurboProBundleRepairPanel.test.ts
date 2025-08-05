import * as vscode from 'vscode';
import { TurboProBundleRepairPanel } from '../../../pro/TurboProBundleRepairPanel';

// Mock VSCode API
const mockWebviewView = {
  webview: {
    html: '',
    options: {},
    asWebviewUri: jest.fn((uri) => uri),
    postMessage: jest.fn(),
    onDidReceiveMessage: jest.fn(),
  },
  onDidDispose: jest.fn(),
  dispose: jest.fn(),
  reveal: jest.fn(),
  title: '',
  description: '',
  badge: undefined,
  show: jest.fn(),
  visible: true,
  viewType: 'test.viewType',
  onDidChangeVisibility: jest.fn(),
} as unknown as vscode.WebviewView;

const mockCommands = {
  executeCommand: jest.fn(),
};

Object.defineProperty(vscode, 'commands', {
  value: mockCommands,
  configurable: true,
});

describe('TurboProBundleRepairPanel', () => {
  let panel: TurboProBundleRepairPanel;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create panel with update mode', () => {
      panel = new TurboProBundleRepairPanel('Network failed', 'update');
      expect(panel).toBeDefined();
    });

    it('should create panel with run mode', () => {
      panel = new TurboProBundleRepairPanel('Bundle corrupted', 'run');
      expect(panel).toBeDefined();
    });
  });

  describe('resolveWebviewView', () => {
    beforeEach(() => {
      panel = new TurboProBundleRepairPanel('Test error', 'update');
    });

    it('should configure webview options', () => {
      panel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.webview.options).toEqual({
        enableScripts: true,
      });
    });

    it('should set up message handling', () => {
      panel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should set initial HTML content', () => {
      panel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.webview.html).toContain('<html>');
      expect(mockWebviewView.webview.html).toContain('Test error');
    });
  });

  describe('updateView', () => {
    beforeEach(() => {
      panel = new TurboProBundleRepairPanel('Initial error', 'update');
      panel.resolveWebviewView(mockWebviewView);
    });

    it('should update mode and error message', () => {
      panel.updateView('run', 'New error message');

      expect(mockWebviewView.webview.html).toContain('New error message');
      expect(mockWebviewView.webview.html).toContain(
        'failed to run your pro bundle',
      );
      expect(mockWebviewView.webview.html).toContain('Retry Run');
    });

    it('should update from run to update mode', () => {
      panel = new TurboProBundleRepairPanel('Initial error', 'run');
      panel.resolveWebviewView(mockWebviewView);

      panel.updateView('update', 'Update failed');

      expect(mockWebviewView.webview.html).toContain('Update failed');
      expect(mockWebviewView.webview.html).toContain(
        'failed to update your previous pro bundle',
      );
      expect(mockWebviewView.webview.html).toContain('Retry Update');
    });

    it('should handle empty error message', () => {
      panel.updateView('update', '');

      expect(mockWebviewView.webview.html).toContain(
        'failed to update your previous pro bundle.',
      );
    });
  });

  describe('webview message handling', () => {
    let messageHandler: (message: { command: string }) => void;

    beforeEach(() => {
      panel = new TurboProBundleRepairPanel('Test error', 'update');
      panel.resolveWebviewView(mockWebviewView);

      // Get the message handler from the mock call
      const onDidReceiveMessageMock = mockWebviewView.webview
        .onDidReceiveMessage as jest.Mock;
      const onDidReceiveMessageCall = onDidReceiveMessageMock.mock.calls[0];
      messageHandler = onDidReceiveMessageCall[0];
    });

    it('should execute retry update command for update mode', async () => {
      await messageHandler({ command: 'retryUpdateProBundle' });

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryProUpdate',
      );
      expect(mockWebviewView.webview.html).toContain('Retrying...');
    });

    it('should execute retry run command for other commands', async () => {
      await messageHandler({ command: 'retryRunProBundle' });

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryProBundleRun',
      );
      expect(mockWebviewView.webview.html).toContain('Retrying...');
    });

    it('should default to run command for unknown commands', async () => {
      await messageHandler({ command: 'unknownCommand' });

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryProBundleRun',
      );
    });
  });

  describe('HTML content generation', () => {
    it('should generate correct HTML for update mode', () => {
      panel = new TurboProBundleRepairPanel('Network timeout', 'update');
      panel.resolveWebviewView(mockWebviewView);

      const html = mockWebviewView.webview.html;

      expect(html).toContain('<html>');
      expect(html).toContain('failed to update your previous pro bundle');
      expect(html).toContain('Network timeout');
      expect(html).toContain('Retry Update');
      expect(html).toContain('retryUpdateProBundle');
      expect(html).toContain('support@turboconsolelog.io');
    });

    it('should generate correct HTML for run mode', () => {
      panel = new TurboProBundleRepairPanel('Bundle execution failed', 'run');
      panel.resolveWebviewView(mockWebviewView);

      const html = mockWebviewView.webview.html;

      expect(html).toContain('failed to run your pro bundle');
      expect(html).toContain('Bundle execution failed');
      expect(html).toContain('Retry Run');
      expect(html).toContain('retryRunProBundle');
    });

    it('should include proper styling', () => {
      panel = new TurboProBundleRepairPanel('Test error', 'update');
      panel.resolveWebviewView(mockWebviewView);

      const html = mockWebviewView.webview.html;

      expect(html).toContain('<style>');
      expect(html).toContain('.primary-color');
      expect(html).toContain('.secondary-color');
      expect(html).toContain('.button');
      expect(html).toContain('color: #FF6B6B');
    });

    it('should include JavaScript for button interaction', () => {
      panel = new TurboProBundleRepairPanel('Test error', 'update');
      panel.resolveWebviewView(mockWebviewView);

      const html = mockWebviewView.webview.html;

      expect(html).toContain('<script>');
      expect(html).toContain('acquireVsCodeApi()');
      expect(html).toContain('addEventListener');
      expect(html).toContain('vscode.postMessage');
    });

    it('should show loading state in HTML', () => {
      panel = new TurboProBundleRepairPanel('Test error', 'update');
      panel.resolveWebviewView(mockWebviewView);

      // Trigger a message to get loading state
      const onDidReceiveMessageMock = mockWebviewView.webview
        .onDidReceiveMessage as jest.Mock;
      const onDidReceiveMessageCall = onDidReceiveMessageMock.mock.calls[0];
      const messageHandler = onDidReceiveMessageCall[0];
      messageHandler({ command: 'retryUpdateProBundle' });

      const html = mockWebviewView.webview.html;
      expect(html).toContain('Retrying...');
      expect(html).toContain('disabled');
    });
  });

  describe('static properties', () => {
    it('should have correct viewType', () => {
      expect(TurboProBundleRepairPanel.viewType).toBe(
        'turboConsoleLogBundleRepairPanel',
      );
    });
  });

  describe('private methods behavior', () => {
    it('should show different messages for update vs run mode', () => {
      const updatePanel = new TurboProBundleRepairPanel(
        'Update error',
        'update',
      );
      updatePanel.resolveWebviewView(mockWebviewView);
      const updateHtml = mockWebviewView.webview.html;

      mockWebviewView.webview.html = ''; // Reset

      const runPanel = new TurboProBundleRepairPanel('Run error', 'run');
      runPanel.resolveWebviewView(mockWebviewView);
      const runHtml = mockWebviewView.webview.html;

      expect(updateHtml).toContain('failed to update your previous pro bundle');
      expect(runHtml).toContain('failed to run your pro bundle');
      expect(updateHtml).not.toContain('failed to run your pro bundle');
      expect(runHtml).not.toContain(
        'failed to update your previous pro bundle',
      );
    });

    it('should show appropriate button text for each mode', () => {
      const updatePanel = new TurboProBundleRepairPanel('Error', 'update');
      updatePanel.resolveWebviewView(mockWebviewView);
      const updateHtml = mockWebviewView.webview.html;

      mockWebviewView.webview.html = ''; // Reset

      const runPanel = new TurboProBundleRepairPanel('Error', 'run');
      runPanel.resolveWebviewView(mockWebviewView);
      const runHtml = mockWebviewView.webview.html;

      expect(updateHtml).toContain('Retry Update');
      expect(runHtml).toContain('Retry Run');
    });

    it('should generate correct post message commands', () => {
      const updatePanel = new TurboProBundleRepairPanel('Error', 'update');
      updatePanel.resolveWebviewView(mockWebviewView);
      const updateHtml = mockWebviewView.webview.html;

      mockWebviewView.webview.html = ''; // Reset

      const runPanel = new TurboProBundleRepairPanel('Error', 'run');
      runPanel.resolveWebviewView(mockWebviewView);
      const runHtml = mockWebviewView.webview.html;

      expect(updateHtml).toContain('retryUpdateProBundle');
      expect(runHtml).toContain('retryRunProBundle');
    });
  });
});
