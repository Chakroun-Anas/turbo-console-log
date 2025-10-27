// Await expression in return
export default {
  name: 'await expression in return',
  fileExtension: '.ts',
  lines: [
    'async function fetchData(api) {',
    '  return await api.getData();',
    '}',
  ],
  selectionLine: 1,
  variableName: 'api.getData',
};
