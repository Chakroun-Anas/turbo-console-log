export default {
  name: 'object literal inside a ternary expression',
  fileExtension: '.ts',
  lines: [
    'const result = isProd',
    '  ? { env: "production" }',
    '  : { env: "dev" };',
  ],
  selectionLine: 0,
  variableName: 'result',
};
