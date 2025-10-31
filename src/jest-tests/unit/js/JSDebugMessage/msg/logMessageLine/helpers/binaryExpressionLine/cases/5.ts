export default {
  name: 'multi-line logical OR expression',
  fileExtension: '.ts',
  lines: [
    'const config =',
    '  externalConfig ||',
    '  fallbackConfig;',
    'use(config);',
  ],
  selectionLine: 1,
  variableName: 'config',
  expectedLine: 3,
};
