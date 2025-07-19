export default {
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
