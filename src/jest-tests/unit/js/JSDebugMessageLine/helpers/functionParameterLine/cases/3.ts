export default {
  name: 'brace on its own line',
  lines: ['function greet(name)', '{', '  return name', '}'],
  selectionLine: 0,
  variableName: 'name',
  expected: 2,
};
