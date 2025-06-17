import { runProBundle } from '../../../../pro/utilities';
import { extensionPropertiesMock } from '../../../mocks/extensionPropertiesMock';

describe('runProBundle', () => {
  it('should call turboConsoleLogPro with extensionProperties', () => {
    const mockFn = jest.fn();

    const fakeBundle = `
      exports.turboConsoleLogPro = function(props) {
        // Call back to the test's mock function via a global
        global.__testHook__(props);
      };
    `;

    // Inject the hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__testHook__ = mockFn;

    // Act
    runProBundle(extensionPropertiesMock, fakeBundle);

    // Assert
    expect(mockFn).toHaveBeenCalledWith(extensionPropertiesMock);
  });

  it('should throw an error if the bundle throws internally', () => {
    const brokenBundle = `
      exports.turboConsoleLogPro = function() {
        throw new Error('Internal error');
      };
    `;

    jest.spyOn(console, 'error').mockImplementation(() => {}); // ⛔ Silence console.error

    expect(() => runProBundle(extensionPropertiesMock, brokenBundle)).toThrow(
      'Failed to load Turbo Console Log Pro — the bundle may be corrupted. Please contact support@turboconsolelog.io',
    );
  });

  it("should throw if the bundle doesn't export turboConsoleLogPro", () => {
    const noExportBundle = `
    // No turboConsoleLogPro defined
  `;

    expect(() => runProBundle(extensionPropertiesMock, noExportBundle)).toThrow(
      'Pro bundle does not export turboConsoleLogPro. Activation failed. Please contact support@turboconsolelog.io',
    );
  });
});
