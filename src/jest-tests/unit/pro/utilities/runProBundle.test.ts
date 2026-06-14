import { extensionPropertiesMock } from '../../../mocks/extensionPropertiesMock';
import { makeExtensionContext } from '../../../mocks/helpers/makeExtensionContext';

describe('runProBundle', () => {
  const mockContext = makeExtensionContext();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should call turboConsoleLogPro with extensionProperties and context', async () => {
    const mockFn = jest.fn();
    const activateProModeMock = jest.fn();
    const deactivateRepairModeMock = jest.fn();
    const fakeBundle = `
      exports.turboConsoleLogPro = function(props, ctx) {
        // Call back to the test's mock function via a global
        global.__testHook__(props, ctx);
      };
    `;
    // Inject the hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__testHook__ = mockFn;
    jest.mock('../../../../helpers/', () => ({
      activateProMode: activateProModeMock,
      deactivateRepairMode: deactivateRepairModeMock,
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle } = require('../../../../pro/utilities');

    // Act
    await runProBundle(extensionPropertiesMock, fakeBundle, mockContext);

    // Assert
    expect(mockFn).toHaveBeenCalledWith(extensionPropertiesMock, mockContext);
    expect(activateProModeMock).toHaveBeenCalled();
    expect(deactivateRepairModeMock).toHaveBeenCalled();
  });

  it('should throw an error if the bundle throws internally', async () => {
    const brokenBundle = `
      exports.turboConsoleLogPro = function() {
        throw new Error('Internal error');
      };
    `;

    jest.spyOn(console, 'error').mockImplementation(() => {}); // ⛔ Silence console.error

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle } = require('../../../../pro/utilities');

    await expect(
      runProBundle(extensionPropertiesMock, brokenBundle, mockContext),
    ).rejects.toThrow(
      'Failed to load Turbo Console Log Pro — the bundle may be corrupted!',
    );
  });

  it("should throw if the bundle doesn't export turboConsoleLogPro", async () => {
    const noExportBundle = `
    // No turboConsoleLogPro defined
  `;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle } = require('../../../../pro/utilities');

    await expect(
      runProBundle(extensionPropertiesMock, noExportBundle, mockContext),
    ).rejects.toThrow(
      'Pro bundle does not export turboConsoleLogPro. Activation failed!',
    );
  });

  it('captures the bundle disposer and invokes it on disposeProBundle()', async () => {
    const disposeMock = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__disposeHook__ = disposeMock;
    jest.mock('../../../../helpers/', () => ({
      activateProMode: jest.fn(),
      deactivateRepairMode: jest.fn(),
    }));
    const fakeBundle = `
      exports.turboConsoleLogPro = function() {};
      exports.disposeIPCServer = function() { global.__disposeHook__(); };
    `;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle, disposeProBundle } = require('../../../../pro/utilities');
    await runProBundle(extensionPropertiesMock, fakeBundle, mockContext);

    // Not invoked until deactivate.
    expect(disposeMock).not.toHaveBeenCalled();

    disposeProBundle();
    expect(disposeMock).toHaveBeenCalledTimes(1);

    // Idempotent: the reference is cleared, so a second call is a no-op.
    disposeProBundle();
    expect(disposeMock).toHaveBeenCalledTimes(1);
  });

  it('disposeProBundle() is a safe no-op when no bundle has run', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { disposeProBundle } = require('../../../../pro/utilities');
    expect(() => disposeProBundle()).not.toThrow();
  });

  it('does not register a disposer when the bundle exports none', async () => {
    jest.mock('../../../../helpers/', () => ({
      activateProMode: jest.fn(),
      deactivateRepairMode: jest.fn(),
    }));
    const fakeBundle = `exports.turboConsoleLogPro = function() {};`;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle, disposeProBundle } = require('../../../../pro/utilities');
    await runProBundle(extensionPropertiesMock, fakeBundle, mockContext);

    expect(() => disposeProBundle()).not.toThrow();
  });
});
