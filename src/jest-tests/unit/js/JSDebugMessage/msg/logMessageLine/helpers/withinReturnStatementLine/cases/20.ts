// Await expression in return
export default {
  name: 'await expression in return',
  fileExtension: '.ts',
  lines: [
    'async function fetchData(promise) {',
    '  return await promise;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'promise',
  expected: 1, // Before the return statement
};
