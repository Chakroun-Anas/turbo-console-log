export default {
  name: 'brace at end of declaration line',
  lines: ['function greet(name) {', '  return name;', '}'],
  selectionLine: 0,
  variableName: 'name',
  expected: 1,
};
