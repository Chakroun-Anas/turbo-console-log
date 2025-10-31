// Prefix unary expression in return (typeof)
export default {
  name: 'prefix unary expression in return',
  fileExtension: '.ts',
  lines: ['function getType(value) {', '  return typeof value.data;', '}'],
  selectionLine: 1,
  variableName: 'value.data',
};
