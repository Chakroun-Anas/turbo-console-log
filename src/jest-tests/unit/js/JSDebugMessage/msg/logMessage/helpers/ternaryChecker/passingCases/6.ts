export default {
  name: 'nested destructuring with ternary',
  lines: [
    'const { config: { apiKey = condition ? "yes" : "no" } } = settings;',
  ],
  selectionLine: 0,
  variableName: 'apiKey',
};
