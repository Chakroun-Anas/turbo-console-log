export default {
  name: 'ternary exists but on different variable below',
  lines: [
    'const config = { retries: 3 };',
    '',
    "const mode = isDev ? 'debug' : 'prod';",
  ],
  selectionLine: 0,
  variableName: 'config',
};
