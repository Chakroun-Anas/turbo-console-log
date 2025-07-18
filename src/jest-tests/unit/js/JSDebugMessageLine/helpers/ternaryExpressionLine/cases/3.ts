export default {
  name: 'parenthesized ternary in assignment',
  lines: ["const val = (cond ? 'x' : 'y');", 'doSomething(val);'],
  selectionLine: 0,
  variableName: 'val',
  expectedLine: 1,
};
