import * as fs from 'fs';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { mockedVscode } from '@/jest-tests/mocks/vscode';

jest.mock('fs', () => ({
  promises: { readFile: jest.fn() },
}));

const mockFsReadFile = fs.promises.readFile as jest.MockedFunction<
  typeof fs.promises.readFile
>;

describe('detectAll quick example', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when file has no logs (fast prefilter)', async () => {
    mockFsReadFile.mockResolvedValue('const a = 1;');
    const vscode = mockedVscode();

    const result = await detectAll(
      fs,
      vscode,
      '/path/to/file.js',
      'log',
      '🚀',
      '~',
    );

    expect(result).toEqual([]);
    expect(mockFsReadFile).toHaveBeenCalledWith('/path/to/file.js', 'utf8');
  });
});
