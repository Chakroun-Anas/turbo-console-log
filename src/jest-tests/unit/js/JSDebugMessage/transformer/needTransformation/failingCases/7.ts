export default {
  fileExtension: '.ts',
  name: 'method parameter inside an object returned by an expression-bodied arrow',
  lines: [
    "Alpine.data('dropdown', () => ({",
    '  select(option) {',
    '    this.selected = option;',
    '  },',
    '}));',
  ],
  selectionLine: 1,
  variableName: 'option',
};
