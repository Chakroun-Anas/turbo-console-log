export default {
  name: 'nested destructuring with ternary',
  fileExtension: '.ts',
  lines: [
    'const { config: { apiKey = condition ? "yes" : "no" } } = settings;',
  ],
  selectionLine: 0,
  variableName: 'apiKey',
};
