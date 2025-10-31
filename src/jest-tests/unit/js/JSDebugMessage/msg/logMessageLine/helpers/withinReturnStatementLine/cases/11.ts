// Element access expression in return
export default {
  name: 'element access expression in return',
  fileExtension: '.ts',
  lines: ['function getItem(items, index) {', '  return items[index];', '}'],
  selectionLine: 1,
  variableName: 'items',
  expected: 1, // Before the return statement
};
