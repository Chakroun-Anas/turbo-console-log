// Nothing after a throw runs, even when the throw fits on one line.
export default {
  name: 'member inside a single-line throw is logged before the throw',
  fileExtension: '.js',
  lines: [
    'async function getJson(url) {',
    '  const response = await fetch(url);',
    '  if (!response.ok) {',
    '    throw new Error(`HTTP ${response.status}`);',
    '  }',
    '}',
  ],
  selectionLine: 3,
  variableName: 'response.status',
  expectedLine: 3,
};
