export default {
  name: "variable name not present in return statement",
  lines: ["def foo():","    return other"],
  selectionLine: 1,
  variableName: "result",
};
