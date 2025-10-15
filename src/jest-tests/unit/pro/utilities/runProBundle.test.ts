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
});
