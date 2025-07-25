export default {
  name: 'ternary buried in call expression',
  lines: ["const status = getValue(cond ? 'yes' : 'no');"],
  selectionLine: 0,
  variableName: 'status',
};
