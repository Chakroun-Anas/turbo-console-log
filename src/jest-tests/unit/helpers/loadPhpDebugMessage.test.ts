import * as vscode from 'vscode';
import { loadPhpDebugMessage } from '@/helpers/loadPhpDebugMessage';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock php-parser module
jest.mock('php-parser', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({})),
  };
});

describe('loadPhpDebugMessage', () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  it('should return null when pro-bundle is not in global state', async () => {
    mockContext.globalState.get = jest.fn().mockReturnValue(undefined);

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).toBeNull();
    expect(mockContext.globalState.get).toHaveBeenCalledWith('pro-bundle');
  });

  it('should return null when createPhpDebugMessage is not found in bundle exports', async () => {
    const mockProBundle = `
      // Empty bundle without createPhpDebugMessage
      module.exports = {};
    `;

    mockContext.globalState.get = jest.fn().mockReturnValue(mockProBundle);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'createPhpDebugMessage not found in Pro bundle exports',
    );

    consoleErrorSpy.mockRestore();
  });

  it('should successfully load and return PHP debug message from Pro bundle', async () => {
    const mockProBundle = `
      exports.createPhpDebugMessage = function(vscode, phpParser) {
        return {
          msg: function() {},
          detectAll: function() { return []; }
        };
      };
    `;

    mockContext.globalState.get = jest.fn().mockReturnValue(mockProBundle);

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('msg');
    expect(result).toHaveProperty('detectAll');
    expect(mockContext.globalState.get).toHaveBeenCalledWith('pro-bundle');
  });

  it('should handle exports on module.exports correctly', async () => {
    const mockProBundle = `
      module.exports.createPhpDebugMessage = function(vscode, phpParser) {
        return {
          msg: function() {},
          detectAll: function() { return []; }
        };
      };
    `;

    mockContext.globalState.get = jest.fn().mockReturnValue(mockProBundle);

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('msg');
  });

  it('should return null and log error when bundle execution fails', async () => {
    const mockProBundle = `
      throw new Error('Bundle execution error');
    `;

    mockContext.globalState.get = jest.fn().mockReturnValue(mockProBundle);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading PHP debug message from Pro bundle:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should return null when createPhpDebugMessage is not a function', async () => {
    const mockProBundle = `
      exports.createPhpDebugMessage = "not a function";
    `;

    mockContext.globalState.get = jest.fn().mockReturnValue(mockProBundle);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'createPhpDebugMessage not found in Pro bundle exports',
    );

    consoleErrorSpy.mockRestore();
  });

  it('should pass vscode and phpParser to the Pro bundle factory', async () => {
    const mockProBundle = `
      exports.createPhpDebugMessage = function(vs, parser) {
        return { msg: () => {}, detectAll: () => [] };
      };
    `;

    mockContext.globalState.get = jest.fn().mockReturnValue(mockProBundle);

    const result = await loadPhpDebugMessage(mockContext);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('msg');
    expect(result).toHaveProperty('detectAll');
  });
});
