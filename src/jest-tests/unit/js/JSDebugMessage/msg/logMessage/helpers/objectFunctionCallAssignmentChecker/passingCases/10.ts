export default {
  name: 'reduce call with object accumulator function',
  fileExtension: '.ts',
  lines: [
    'const values = FLAG_COLUMNS.reduce((acc, key) => {',
    '  acc[key] = FLAG_CONFIG[key](flag);',
    '  return acc;',
    '}, {});',
  ],
  selectionLine: 0,
  variableName: 'values',
};
