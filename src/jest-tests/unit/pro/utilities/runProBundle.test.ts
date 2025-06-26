import { extensionPropertiesMock } from '../../../mocks/extensionPropertiesMock';

describe('runProBundle', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it('should call turboConsoleLogPro with extensionProperties', () => {
    const mockFn = jest.fn();
    const activateProModeMock = jest.fn();
    const deactivateRepairModeMock = jest.fn();
    const fakeBundle = `
      exports.turboConsoleLogPro = function(props) {
        // Call back to the test's mock function via a global
        global.__testHook__(props);
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
    runProBundle(extensionPropertiesMock, fakeBundle);

    // Assert
    expect(mockFn).toHaveBeenCalledWith(extensionPropertiesMock);
    expect(activateProModeMock).toHaveBeenCalled();
    expect(deactivateRepairModeMock).toHaveBeenCalled();
  });

  it('should throw an error if the bundle throws internally', () => {
    const brokenBundle = `
      exports.turboConsoleLogPro = function() {
        throw new Error('Internal error');
      };
    `;

    jest.spyOn(console, 'error').mockImplementation(() => {}); // ⛔ Silence console.error

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle } = require('../../../../pro/utilities');

    expect(() => runProBundle(extensionPropertiesMock, brokenBundle)).toThrow(
      'Failed to load Turbo Console Log Pro — the bundle may be corrupted!',
    );
  });

  it("should throw if the bundle doesn't export turboConsoleLogPro", () => {
    const noExportBundle = `
    // No turboConsoleLogPro defined
  `;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { runProBundle } = require('../../../../pro/utilities');

    expect(() => runProBundle(extensionPropertiesMock, noExportBundle)).toThrow(
      'Pro bundle does not export turboConsoleLogPro. Activation failed!',
    );
  });
});
