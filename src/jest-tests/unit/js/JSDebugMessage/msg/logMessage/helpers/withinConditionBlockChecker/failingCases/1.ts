export default {
  name: 'should not detect property access in while loop condition',
  fileExtension: '.ts',
  lines: ['while (config.retryCount > 0) {', '  config.retryCount--;', '}'],
  selectionLine: 0,
  variableName: 'config.retryCount',
  expected: false,
};
