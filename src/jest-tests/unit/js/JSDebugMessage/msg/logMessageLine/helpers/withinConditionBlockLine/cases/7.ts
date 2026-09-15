// Before the `} else if` line is the previous branch: the else-if condition
// is logged at the top of its own body.
export default {
  name: 'should insert at the top of the else-if body',
  lines: ['if (a) {', '  x();', '} else if (b.value) {', '  y();', '}'],
  fileExtension: '.ts',
  selectionLine: 2,
  variableName: 'b.value',
  expectedLine: 3,
};
