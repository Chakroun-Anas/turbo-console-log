export default {
  name: 'should insert before single statement for if without braces',
  lines: ['if (user.isActive)', '  return "active";'],
  selectionLine: 0,
  variableName: 'user.isActive',
  expectedLine: 0,
};
