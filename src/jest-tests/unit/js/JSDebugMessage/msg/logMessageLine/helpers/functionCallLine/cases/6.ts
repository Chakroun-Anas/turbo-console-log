export default {
  fileExtension: '.ts',
  name: 'async function call inside IIFE',
  lines: [
    'const data = await (async () => {',
    '  return await fetchData();',
    '})();',
  ],
  selectionLine: 0,
  variableName: 'data',
  expectedLine: 3,
};
