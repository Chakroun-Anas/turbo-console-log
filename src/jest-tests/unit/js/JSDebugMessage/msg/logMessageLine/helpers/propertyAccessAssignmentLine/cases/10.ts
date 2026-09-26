export default {
  name: 'identifier compound-assigned (+=) over several lines',
  lines: [
    'let total = 0;',
    'total +=',
    '  price *',
    '  quantity;',
    'use(total);',
  ],
  fileExtension: '.ts',
  selectionLine: 1,
  variableName: 'total',
  expectedLine: 4,
};
