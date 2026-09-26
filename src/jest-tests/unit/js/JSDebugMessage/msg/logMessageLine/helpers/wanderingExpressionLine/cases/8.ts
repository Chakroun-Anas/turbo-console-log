// A log between a label and its loop makes `break search` stop parsing.
export default {
  name: 'loop header under a label is logged before the label',
  fileExtension: '.js',
  lines: [
    'function scan(matrix) {',
    '  search:',
    '  for (const row of matrix) {',
    '    for (const cell of row) {',
    '      if (cell < 0) break search;',
    '    }',
    '  }',
    '}',
  ],
  selectionLine: 2,
  variableName: 'matrix',
  expectedLine: 1,
};
