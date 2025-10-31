export default {
  name: 'ternary inside function return',
  fileExtension: '.ts',
  lines: [
    'function getStatus() {',
    "  return cond ? 'success' : 'fail';",
    '}',
    'console.log(getStatus());',
  ],
  selectionLine: 1,
  variableName: 'cond',
  expectedLine: 2,
};
