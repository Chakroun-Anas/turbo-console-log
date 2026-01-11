import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { generateDeveloperId } from '@/helpers/generateDeveloperId';

// Mock dependencies
jest.mock('crypto');

const mockedCrypto = crypto as jest.Mocked<typeof crypto>;

// Mock vscode env to make it mutable
const mockVscodeEnv = {
  machineId: 'test-machine-id',
  language: 'en',
};

// Override the vscode env export
Object.defineProperty(vscode, 'env', {
  value: mockVscodeEnv,
  configurable: true,
  writable: true,
});

describe('generateDeveloperId', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset env mock values
    mockVscodeEnv.machineId = 'test-machine-id';
    mockVscodeEnv.language = 'en';

    // Setup crypto mock
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('abcd1234567890ef'),
    };
    mockedCrypto.createHash.mockReturnValue(mockHash as unknown as crypto.Hash);

    // Setup process mocks
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });
  });

  it('should generate consistent developer ID with crypto available', () => {
    const developerId = generateDeveloperId();

    expect(mockedCrypto.createHash).toHaveBeenCalledWith('sha256');
    expect(developerId).toBe('dev_abcd1234567890ef');
  });

  it('should use all machine-specific identifiers in hash', () => {
    generateDeveloperId();

    expect(mockedCrypto.createHash).toHaveBeenCalledWith('sha256');

    const mockHash = mockedCrypto.createHash('sha256');
    expect(mockHash.update).toHaveBeenCalledWith(
      'test-machine-id-en-darwin-x64-turbo-console-log-stable',
    );
  });

  it('should fallback to simple hash when crypto is not available', () => {
    // Mock crypto as unavailable
    mockedCrypto.createHash.mockImplementation(() => {
      throw new Error('crypto unavailable');
    });

    const developerId = generateDeveloperId();

    // Should use dev_machine_ format in catch block
    expect(developerId).toBe('dev_machine_test-machine-id');
  });

  it('should use machine ID fallback when crypto fails', () => {
    // Mock crypto as unavailable
    mockedCrypto.createHash.mockImplementation(() => {
      throw new Error('crypto unavailable');
    });

    mockVscodeEnv.machineId = 'specific-machine-id';

    const developerId = generateDeveloperId();

    // Should use dev_machine_ format with substring(0, 16)
    expect(developerId).toBe('dev_machine_specific-machine');
  });

  it('should handle missing machineId gracefully', () => {
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('1234567890abcdef'),
    };
    mockedCrypto.createHash.mockReturnValue(mockHash as unknown as crypto.Hash);

    mockVscodeEnv.machineId = '';

    const developerId = generateDeveloperId();

    // Should use 'unknown-machine' as fallback
    expect(mockHash.update).toHaveBeenCalledWith(
      'unknown-machine-en-darwin-x64-turbo-console-log-stable',
    );
    expect(developerId).toBe('dev_1234567890abcdef');
  });

  it('should handle missing language gracefully', () => {
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('fedcba0987654321'),
    };
    mockedCrypto.createHash.mockReturnValue(mockHash as unknown as crypto.Hash);

    mockVscodeEnv.language = '';

    const developerId = generateDeveloperId();

    // Should use 'unknown-language' as fallback
    expect(mockHash.update).toHaveBeenCalledWith(
      'test-machine-id-unknown-language-darwin-x64-turbo-console-log-stable',
    );
    expect(developerId).toBe('dev_fedcba0987654321');
  });

  it('should handle errors with ultimate fallback', () => {
    // Mock crypto to throw
    mockedCrypto.createHash.mockImplementation(() => {
      throw new Error('crypto error');
    });

    // Mock machineId to cause fallback chain
    mockVscodeEnv.machineId = 'fallback-machine';

    const developerId = generateDeveloperId();

    // Catch block uses dev_machine_ format with substring(0, 16)
    expect(developerId).toBe('dev_machine_fallback-machine');
  });

  it('should use timestamp fallback when machineId is unknown-machine', () => {
    // Mock crypto to throw
    mockedCrypto.createHash.mockImplementation(() => {
      throw new Error('crypto error');
    });

    // Mock env to have 'unknown-machine' machineId
    mockVscodeEnv.machineId = 'unknown-machine';

    const developerId = generateDeveloperId();

    // Should use timestamp fallback format
    expect(developerId).toMatch(/^dev_fallback_[a-z0-9]+_[a-z0-9]{6}$/);
  });

  it('should generate consistent IDs for same inputs', () => {
    const id1 = generateDeveloperId();
    const id2 = generateDeveloperId();

    expect(id1).toBe(id2);
    expect(id1).toBe('dev_abcd1234567890ef');
  });

  it('should include extension-specific salt in hash', () => {
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('abc123'),
    };
    mockedCrypto.createHash.mockReturnValue(mockHash as unknown as crypto.Hash);

    generateDeveloperId();

    expect(mockHash.update).toHaveBeenCalledWith(
      expect.stringContaining('turbo-console-log-stable'),
    );
  });

  it('should truncate hash to 16 characters', () => {
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('abcdefghijklmnopqrstuvwxyz1234567890'),
    };
    mockedCrypto.createHash.mockReturnValue(mockHash as unknown as crypto.Hash);

    const developerId = generateDeveloperId();

    // Should be 'dev_' + first 16 chars
    expect(developerId).toBe('dev_abcdefghijklmnop');
    expect(developerId.length).toBe(20); // 4 (dev_) + 16
  });

  it('should handle different platforms correctly', () => {
    const platforms = ['darwin', 'linux', 'win32'];

    platforms.forEach((platform) => {
      Object.defineProperty(process, 'platform', {
        value: platform,
        configurable: true,
      });

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('platformhash12345'),
      };
      mockedCrypto.createHash.mockReturnValue(
        mockHash as unknown as crypto.Hash,
      );

      generateDeveloperId();

      expect(mockHash.update).toHaveBeenCalledWith(
        expect.stringContaining(platform),
      );
    });
  });

  it('should handle different architectures correctly', () => {
    const architectures = ['x64', 'arm64', 'ia32'];

    architectures.forEach((arch) => {
      Object.defineProperty(process, 'arch', {
        value: arch,
        configurable: true,
      });

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('archhash1234567890'),
      };
      mockedCrypto.createHash.mockReturnValue(
        mockHash as unknown as crypto.Hash,
      );

      generateDeveloperId();

      expect(mockHash.update).toHaveBeenCalledWith(
        expect.stringContaining(arch),
      );
    });
  });
});
