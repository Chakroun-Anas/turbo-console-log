export default {
  name: 'multi-line return with ternary',
  fileExtension: '.ts',
  lines: [
    'function check() {',
    '  return cond',
    "    ? 'valid'",
    "    : 'invalid';",
    '}',
  ],
  selectionLine: 1,
  variableName: 'cond',
  expectedLine: 4,
};
