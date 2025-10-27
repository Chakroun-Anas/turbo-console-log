export default {
  name: 'logical AND assignment',
  fileExtension: '.ts',
  lines: [
    'function test() {',
    '  let x = 1;',
    '  const result = isValid && isReady;',
    '  return result;',
    '}',
  ],
  selectionLine: 2,
  variableName: 'result',
  expectedLine: 3,
};
