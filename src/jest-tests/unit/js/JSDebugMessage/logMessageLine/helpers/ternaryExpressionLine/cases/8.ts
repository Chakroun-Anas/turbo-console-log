export default {
  name: 'ternary in array element',
  lines: ["const arr = [cond ? 'a' : 'b', 'c'];", 'console.log(arr);'],
  selectionLine: 0,
  variableName: 'arr',
  expectedLine: 1,
};
